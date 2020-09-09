const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [7, 'Password must contain at least 6 characters'],
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }

    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  contacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

// Hide user private data
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.tokens
  delete userObject.password

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  const isMatch = await bcrypt.compare(password, user.password)
  if (!user || !isMatch) {
    throw new Error('Unable to log in')
  }
  return user
}

// Middleware for the mongoose.save() function
userSchema.pre('save', async function (next) {
  const user = this
  // Only if password is created or modified - Hash the plain text
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;