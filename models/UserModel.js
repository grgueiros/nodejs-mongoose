const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
  name: {
    type: mongoose.SchemaTypes.String
  },
  email: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
  password: {
    type: mongoose.SchemaTypes.String,
    required: true
  }
})

const User = mongoose.model('User', UserSchema)


module.exports = User