const request = require('supertest');
const app = require('../src/app')
const Task = require('../src/models/task');
const mongoose = require('mongoose');
const { userOneId, userOne, userTwo, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase);

test('Create Tasks for a user', async() => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description:'This is a random description'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.isCompleted).toEqual(false)
})

