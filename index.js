const http = require('http')
const lib = {
  calendar: require('./lib/calendar'),
  map: require('./lib/map'),
  rolodex: require('./lib/rolodex')
}

module.exports = createHandler => http.createServer((req, res) => {
  let handler = createHandler(lib)
  if (handler(req, res)) return true
  else {
    console.log('Not found', req.url)
    res.statusCode = 404
    res.end()
  }
})
