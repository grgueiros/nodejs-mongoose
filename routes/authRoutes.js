const router = require('express').Router()
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const routeName = path.basename(__filename).split('Routes')[0]

router.post('/register', async (req, res) => {
  const userData = req.body

  const requiredFields = ['name', 'email', 'password', 'confirmPassword']

  const missingFields = requiredFields.filter(field => !userData[field])

  if (missingFields.length > 0) {
    res.status(400).json({ message: `Requested fields not found : ${missingFields}` })
    return
  }


  if (userData.password !== userData.confirmPassword) {
    res.status(400).json({ message: `Password and confimation don't match` })
    return
  }

  const emailExists = await User.findOne({ email: userData.email })

  if (emailExists) {
    res.status(400).json({ message: `User already exists` })
    return
  }


  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(userData.password, salt)

  const user = new User({
    name: userData.name,
    email: userData.email,
    password: passwordHash
  })

  try {

    const newUser = await user.save()

    const token = jwt.sign(
      {
        name: newUser.name,
        id: newUser._id
      },
      process.env.APP_SECRET
    )

    res.status(201).json({ message: 'User successfully created', token, userId: newUser._id })

  } catch (err) {
    res.status(500).json(err.message)
  }

})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  const passwordIsValid = await bcrypt.compare(password, user.password)

  if (!user || !passwordIsValid) {
    return res.status(400).json({ message: "User or password is invalid" })
  }

  const token = jwt.sign(
    {
      name: user.name,
      id: user._id
    },
    process.env.APP_SECRET
  )

  res.status(200).json({ message: 'User successfully authenticated', token, userId : user._id })

})

module.exports = app => {
  app.use('/api/' + routeName, router)
}