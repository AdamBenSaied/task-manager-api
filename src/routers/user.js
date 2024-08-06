const express = require('express');
const router = new express.Router()
const User = require("../models/user");
const {response} = require("express");
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')

// FOR FILE UPLOAD
const upload = multer({
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only Images allowed'))
        }
        cb(undefined, true)
    }
})

// Register
router.post('/user/register', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error);
    }


})
// Login
router.post('/user/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }

})
//logout
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
})
//logout all devices
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.status(200).send()

    } catch (err) {
        res.status(500).send()
    }


})
// Read Profile
router.get('/user/me', auth, async (req, res) => {

    try {
        res.send(req.user)
    } catch (e) {
        res.status(400).send('Bad Request')
    }


})
// Modify ConnectedProfile
router.patch('/user/updateMe', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    const user = req.user
    const isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidUpdate) {
        return res.status(400).send('Tried to update wrong/missing Updates')
    }

    try {
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(500).send('Server problem')
    }

})
//Delete Profile
router.delete('/user/deleteMe', auth, async (req, res) => {
    try {
        await req.user.deleteOne(req.user)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//Update Avatar
router.post('/user/me/uploadAvatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send('Please, upload a photo !')
})
//delete Avatar
router.delete('/user/me/deleteAvatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send('Server problem')
    }
})
//get avatar
router.get('/user/me/getAvatar', auth,async (req, res) => {
    try {

        if (!req.user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(req.user.avatar)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router