const browserify = require('browserify')
const response = require('response')
const fs = require('fs')

const startswith = (str, key) => str.slice(0, key.length) === key
const ext = str => str.slice(str.lastIndexOf('.') + 1)

const createHandler = lib => {
  const handler = (req, res) => {
    for (let key in lib) {
      if (startswith(req.url, `/${key}`)) {
        let page = lib[key](req, res)
        if (typeof page === 'string') {
          let extension = ext(page)
          if (extension === 'js') {
            console.log('js', page)
            let b = browserify(page)
            b.transform('brfs')
            res.statusCode = 200
            res.setHeader('content-type', 'text/javascript')
            b.bundle().pipe(res)
          }
          if (extension === 'html' || extension === 'json') {
            fs.createReadStream(page).pipe(response()).pipe(res)
          }
        }
        return page
      }
    }
    return false
  }
  return handler
}

const httpServer = require('./')(createHandler)
httpServer.listen(8080, () => {
  console.log('http://localhost:8080/')
})
