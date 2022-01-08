const jwt = require('jsonwebtoken')


module.exports = async (token) => {

  const user = await jwt.verify(token, process.env.APP_SECRET)

  return user


}