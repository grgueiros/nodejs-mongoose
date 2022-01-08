const router = require('express').Router()
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const Party = require('../models/PartyModel')

const routeName = path.basename(__filename).split('Routes')[0]


const diskStorage = require('../helpers/file-storage')
const upload = multer({ storage: diskStorage })

const getUserByToken = require('../helpers/get-user-by-token')


router.get('/', (req, res) => {
  res.send('Aqui mesmo')
})

router.post('/', upload.fields([{ name: 'photos' }]), async (req, res) => {
  try {
    const { title, description, partyDate, privacy } = req.body;
    const files = req.files

    const dateToSave = new Date(partyDate)
    const photos = []

    if (files?.length > 0) {
      files.forEach((photo, i) => {
        photos[i] = photo.path
      })
    }

    const party = await Party.create({
      title,
      description,
      partyDate: dateToSave,
      userId: mongoose.Types.ObjectId(req.user.id),
      photos,
      privacy: !privacy ? false : privacy
    })

    res.status(201).json({ message: 'Party successfully created', data: party })
  } catch (err) {
    res.status(500).json({ error: err.message, message: 'Could not save party' })
  }
})

router.get('/all', async (req, res) => {
  try {
    const parties = await Party.find({ privacy: false }).sort({ _id: -1 })

    res.status(200).json({ data: parties })
  } catch (err) {
    res.status(400).json(err.message)
  }
})

router.get('/userparties', async (req, res) => {
  try {

    const userId = mongoose.Types.ObjectId(req.user.id)

    const partiesFromUser = await Party.find({ userId }).sort({ _id: -1 })
    res.json({ data: partiesFromUser })
  } catch (err) {
    res.status(400).json(err.message)
  }
})

router.get('/userparty/:id', async (req, res) => {
  try {
    const { id } = req.params

    const party = await Party.findOne({ _id: id, userId: req.user.id })

    if (!party) {
      return res.status(404).json({ error: 'Party not found' })
    }

    res.json({ data: party })

  } catch (err) {
    res.status(400).json(err.message)
  }
})

router.get('/details/:_id', async (req, res) => {

  try {
    const { _id } = req.params;

    const party = await Party.findOne({ _id })

    if (!party) {
      return res.status(404).json({ error: 'Party not found' })
    }

    if (party.privacy === false) {
      return res.json({ data: party })
    }

    const token = req.header('Authorization')?.split(' ')[1]
    const userFromToken = await getUserByToken(token)

    if (party.userId.toString() === userFromToken.id) {

      return res.json(party)
    }

    res.status(404).json({ error: 'Party not found' })

  } catch (err) {
    res.status(400).json(err.message)
  }
})

router.delete('/:_id', async (req, res) => {
  try {
    const user = req.user;
    const { _id } = req.params

    if (!user) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const party = await Party.findOne({ _id, userId: user.id })

    if (!party) {
      return res.status(404).json({ message: 'Party not found' })
    }

    await Party.deleteOne({ _id })

    res.status(200).end()

  } catch (err) {
    res.status(500).json(err.message)
  }
})

router.put('/:_id', upload.fields([{ name: 'photos' }]), async (req, res) => {
  try {
    const user = req.user
    const { _id } = req.params
    const { title, description, partyDate, privacy } = req.body

    const party = await Party.findOne({ _id, userId: user.id })

    if (!party) {
      return res.status(404).json({ message: 'Party not found' })
    }

    const dateToSave = new Date(partyDate)
    const photos = []

    if (files?.length > 0) {
      files.forEach((photo, i) => {
        photos[i] = photo.path
      })
    }

    await Party.updateOne({ _id }, { title, description, partyDate: dateToSave, privacy, photos })
    res.status(200).end()

  } catch (err) {
    res.status(400).json(err.message)
  }
})


module.exports = app => {
  app.use('/api/' + routeName, router)
}