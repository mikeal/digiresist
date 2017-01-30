/* globals L */
const bel = require('bel')
const data = require('../rolodex/alldata')

function toPoint (ev) {
  const ret =
    { type: 'Feature',
      geometry:
      { type: 'Point',
        coordinates: [ev.geocode.longitude, ev.geocode.latitude]
      },
      properties:
      { title: ev.title,
        link: ev.link,
        // image: ev.image,
        description: `${ev.title} ${ev.website || ''}`,
        'marker-size': 'medium',
        'marker-symbol': 'star-stroked',
        'marker-color': '#f7da03'
      }
    }
  return ret
}


function haversine () {
  let radians = Array.prototype.map.call(arguments, d => d / 180.0 * Math.PI)
  let lat1 = radians[0]
  let lon1 = radians[1]
  let lat2 = radians[2]
  let lon2 = radians[3]
  let R = 6372.8 // km
  let dLat = lat2 - lat1
  let dLon = lon2 - lon1
  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) *
          Math.cos(lat1) * Math.cos(lat2)
  let c = 2 * Math.asin(Math.sqrt(a))
  return R * c
}

L.mapbox.accessToken = 'pk.eyJ1Ijoibm9kZWpzLWZvdW5kYXRpb24iLCJhIjoiY2locDlqOHI5MDNwbnRzbTJqdzRyZXExayJ9.bwlwXqWIaQw_JqzW39M1Dg'

let map = L.mapbox.map('map-container', 'mapbox.streets-basic')
let featureLayer = L.mapbox.featureLayer().addTo(map)

featureLayer.on('layeradd', e => {
  var marker = e.layer
  var feature = marker.feature
  var props = feature.properties
  // console.log(feature)
  var html = ''

  if (props.link) {
    html += '<div class="marker-title"><a href="' + props.link + '">' + props.title + '</a></div>'
  } else {
    html += '<div class="marker-title">' + props.title + '</div>'
  }
  if (props.description && props.description.length > 400) {
    html += '<div class="marker-description">' + props.description.slice(0, 400) + '...</div>'
  } else if (props.description) {
    html += '<div class="marker-description">' + props.description + '</div>'
  }
  if (props.image) {
    html += '<div class="marker-image"><img src="' + props.image + '" /></div>'
  }

  let elem = bel(['<div>'+html+'</div>'])

  marker.bindPopup(elem, { minWidth: 320 })
})

featureLayer.on('ready', function () {
  if ('geolocation' in navigator) {
    /* geolocation is available */
    navigator.geolocation.getCurrentPosition(position => {
      let lat = position.coords.latitude
      let lon = position.coords.longitude

      let points = featureLayer.getGeoJSON().features.map(feature => {
        let _lat = feature.geometry.coordinates[1]
        let _lon = feature.geometry.coordinates[0]
        let dist = haversine(lat, lon, _lat, _lon)
        return {lon: _lon, lat: _lat, dist: dist}
      })
      .sort((a, b) => {
        return a.dist > b.dist ? 1 : a.dist < b.dist ? -1 : 0
      })
      var nearest = []
      var _dist = 0
      var i = 1
      while (nearest < 10 || _dist < 5) {
        nearest.push(points[i - 1])
        _dist = points[i].dist
        i++
      }
      nearest.push({lat: lat, lon: lon})
      map.fitBounds(nearest)
    })
  }
})

let geodata = {type: 'FeatureCollection', features: data.map(toPoint)}
featureLayer.setGeoJSON(geodata)
console.log(geodata)
map.fitBounds(data.map(o => {
  return {lat: o.geocode.latitude, lon: o.geocode.longitude}
}))