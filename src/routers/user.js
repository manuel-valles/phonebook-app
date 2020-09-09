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

router.post('/user/contact', auth, async (req, res) => {
  const user = req.user
  const contact = user.contacts.find(contact => contact.phone === req.body.phone)
  try {
    if(!contact) {
      user.contacts.push({
        name: req.body.name, 
        phone: req.body.phone
      })
      await user.save()
      res.status(201).send(user)
    } else {
      res.status(404).send({ error: `The phone number already exists in your list of contacts with the name: ${contact.name}` })
    }
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/user/contacts', auth, async (req, res) => {
  try {
    res.send(req.user.contacts)
  } catch (error) {
    res.status(404).send()
  }
})

router.patch('/user/contact/:id', auth, async (req, res) => {
  const user = req.user
  const index = user.contacts.findIndex(contact => contact._id == req.params.id)
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'phone']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }
  
  try {
    if(index > -1){
      user.contacts.map(contact => {
        if(contact._id == req.params.id) updates.forEach(update => contact[update] = req.body[update])
      })
      await user.save()
      res.send(user)
    } else {
      res.status(404).send({ error: 'Contact not found' })
    }
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/user/contact/:id', auth, async (req, res) => {
  const user = req.user
  const index = user.contacts.findIndex(contact => contact._id == req.params.id)

  try {
    if(index > -1) {
      user.contacts.splice(index, 1)
      await user.save()
      res.send(user)
    } else {
      res.status(404).send({ error: 'Contact not found' })
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
