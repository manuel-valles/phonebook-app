// jwt for the headers authentication
const jwt = require('jsonwebtoken')
// mongoose for the ObjectId
const mongoose = require('mongoose')
const User = require('../../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Manu One',
  email: 'one@example.com',
  phone: '07568159870',
  password: 'AnExamplePass01!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoId,
  name: 'Manu Two',
  email: 'two@example.com',
  phone: '07568159871',
  password: 'AnExamplePass02!',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
  }]
}

const setupDatabase = async () => {
  await User.deleteMany()
  await new User(userOne).save()
  await new User(userTwo).save()
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  setupDatabase
}