const bypassRoutes = require('./bypassRoutes.json')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const checkToken = (req, res, next) => {

  if (bypassRoutes.urls.includes(req.path)) {
    return next()
  }

  if (bypassRoutes.regex.filter(regex => new RegExp(regex).test(req.path)).length > 0) {
    return next()
  }

  if (!req.headers.authorization) {
    return res.status(403).json({ message: 'Token no provided' })
  }

  const tokenParts = req.headers.authorization.split(' ')
  const [type, token] = tokenParts

  if (type !== 'Bearer') {
    return res.status(400).json({ message: 'Token malformed' })
  }

  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {

    if (err) {
      return res.status(400).json({ message: 'Token invalid or expired' })
    }

    req.user = decoded

    return next()
  })


}

module.exports = checkToken