const express = require('express')
const User = require('../models/user')
const { auth } = require('../middleware/auth')
const router = new express.Router()

router.post('/user', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})
router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send({ error: 'Incorrect credentials. Please try again' })
  }
})

router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/user/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
  // error handling if the user tries to update a non existing field
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'phone', 'email', 'password']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/user/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
