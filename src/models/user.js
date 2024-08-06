const validator = require('validator');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error('Age must be greater than 0')
        }
    }, email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('Email is not valid !')
        }
    }, password: {
        type: String,
        minLength: 7,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password') === true) {
                throw new Error('Password must not contain the word password ')
            }
        }
    }, tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})
// Bidirectional Virtual Relationship with Tasks
userSchema.virtual('userTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: "owner"
})

// Method to Hide JSON variables ( needs to be named like this )
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject._id
    delete userObject.__v
    delete userObject.avatar

    return userObject


}

// Method to generate the AuthToken
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//Static Method to Find a user by Credentials
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})

    if (!user) {
        throw new Error('Unable to Login.')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to Login')
    }
    return user
}


//Hash Password
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('deleteOne', {document: true, query: false}, async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})


const User = mongoose.model('User', userSchema)


module.exports = User