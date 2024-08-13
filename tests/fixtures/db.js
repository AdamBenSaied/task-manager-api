const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const User = require ("../../src/models/user")

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Adam',
    email: "admin@gmail.com",
    password: "123dsad45",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET),
    }]
}
const userTwo = {
    name: 'John Doe',
    email: "DoeJohn@gmail.com",
    password: "1dsa4185"
}
const setupDatabase = async () => {
    await User.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
}
module.exports = {
    userOneId,
    userOne,
    userTwo,
    setupDatabase
}