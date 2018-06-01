/*
 * BrowsersSync config
 */

const path = require('path')
const fs = require('fs')

const PATH = (...p) => path.join(__dirname, ...p)

module.exports = {
  notify: false,
  open: false,
  reloadDebounce: 2,
  server: PATH('app')
}