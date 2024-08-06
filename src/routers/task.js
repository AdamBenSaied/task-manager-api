const express = require("express");
const router = new express.Router()
const Task = require("../models/task");
const auth = require("../middlewares/auth");

//Create New Task
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send('task was not sent as it should be')
    }

})
//Get Tasks ( completed, not completed, or all if not specified in params )
router.get('/tasks', auth, async (req, res) => {

    const match = {owner: req.user._id};
    const sort = {}
    const options = {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip)
    }

    if (req.query.isCompleted) {
        match.isCompleted = req.query.isCompleted === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1]==='desc' ? -1 : 1
    }


    try {
        const tasks = await Task.find(match).skip(options.skip).limit(options.limit).sort(sort);
        res.status(200).send(tasks)
    } catch (e) {
        res.status(404).send('No tasks found.')
    }
})
// Get Task By Id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('Task not found.');
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send('Bad request !!')
    }
})
//Update Task By Id
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'isCompleted'];
    const isValidUpdates = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidUpdates) {
        return res.status(400).send('Tried to update wrong/missing Updates : Bad Request !')
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('Task not found.')
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send('Server Error !')
    }

})
//Delete Task By Id
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task) {
            res.status(404).send('Task Not Found')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send('Server Error')

    }


})


module.exports = router