// Supertest uses the 'request' convection (optional)
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
  const response = await request(app).post('/user').send({
    name: 'Manu Three',
    email: 'three@example.com',
    phone: '07568159873',
    password: 'AvalidPass03!'
  }).expect(201)

  // Assert that the DB has changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Manu Three',
      email: 'three@example.com',
      phone: '07568159873'
    },
    token: user.tokens[0].token
  })
  // Expecting no plain text for the password
  expect(user.password).not.toBe('AvalidPass03!')
})

test('Should login existing userOne', async () => {
  const response = await request(app).post('/user/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  // Assert that token in response matches user second token 
  // (1st token was created in the lifecycle - 2nd during this login)
  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async () => {
  await request(app).post('/user/login').send({
    email: userOne.email,
    password: 'NoRightPass01!'
  }).expect(400)
})

test('Should get profile for authenticate user', async () => {
  await request(app)
    .get('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticate user', async () => {
  await request(app)
    .get('/user/me')
    .send()
    .expect(401)
})

test('Should delete account for authenticated user', async () => {
  await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  // Assert null response since user has been removed
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticate user', async () => {
  await request(app)
    .delete('/user/me')
    .send()
    .expect(401)
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Manu Two'
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toBe('Manu Two')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'London'
    })
    .expect(400)
})