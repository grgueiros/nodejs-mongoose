const mongoose = require('mongoose')

const PartySchema = new mongoose.Schema({
  title: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
  description: {
    type: mongoose.SchemaTypes.String
  },
  partyDate: {
    type: mongoose.SchemaTypes.Date,
    required: true
  },
  photos: {
    type: mongoose.SchemaTypes.Array
  },
  privacy: {
    type: mongoose.SchemaTypes.Boolean,
    required: true
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  }
})


const Party = mongoose.model('Party', PartySchema)

module.exports = Party