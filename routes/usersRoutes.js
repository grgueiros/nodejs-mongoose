const router = require('express').Router()
const path = require('path')
const bcrypt = require('bcrypt')

const User = require('../models/UserModel')

const routerName = path.basename(__filename).split('Routes')[0]

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findOne({ _id: id }, { password: 0, __v: 0 })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json(err.message)
  }
})

router.put('/', async (req, res) => {

  const requiredFields = ['id', 'name', 'email',]
  const missingFields = requiredFields.filter(field => !req.body[field])

  const { id } = req.body

  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Required fields missing : ${missingFields}` })
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: `Password and confimation don't match` })
  }

  const user = User.findOne({ _id: id })

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }



  const userToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }

  if (req.body.password && req.body.confirmPassword) {
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(req.body.password, salt)
    userToUpdate.password = passwordHash
  }

  try {

    await User.updateOne({ _id: id }, { $set: userToUpdate })
    res.status(204).end()

  } catch (err) {
    res.status(500).json(err.message)
  }


})

module.exports = app => {
  app.use('/api/' + routerName, router)
}