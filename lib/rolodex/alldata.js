const fs = require('fs')
module.exports = JSON.parse(fs.readFileSync(__dirname + '/muslimban.json'))
