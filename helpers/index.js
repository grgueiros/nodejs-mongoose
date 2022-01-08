const checkToken = require("./check-token")


module.exports = (app) => {
  app.use(checkToken)
}