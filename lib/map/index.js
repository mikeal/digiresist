const path = require('path')

const page = path.join(__dirname, 'map.html')
const js = path.join(__dirname, 'map.js')

module.exports = (req, res) => {
  if (req.url === '/map' || req.url === '/map/') {
    return page
  }
  if (req.url === '/map/map.js') {
    console.log(js)
    return js
  }
}
