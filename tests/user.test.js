const request = require('supertest');
const app = require('../src/app')
const User = require('../src/models/user');
const { userOneId, userOne, userTwo, setupDatabase } = require('./fixtures/db')



beforeEach(setupDatabase);

test('should signup', async () => {
    const response = await request(app).post('/user/register').send({
        name: 'Adam',
        email: 'email@email.com',
        password: 'AdamBenSaied'
    }).expect(201)


    const user = await User.findOne({'tokens.token': response.body.token})

    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: "Adam",
            email: 'email@email.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('AdamBenSaied')
})

test('should login existing User', async () => {
    const response = await request(app).post('/user/login').send({
        email: userOne.email,
        password: userOne.password

    }).expect(200)

    const user = await User.findOne({'tokens.token': response.body.token})
    expect(user).not.toBeNull()
    expect(user.tokens[1].token).toBe(response.body.token)

})

test('should Not login / User NonExistent', async () => {
    await request(app).post('/user/login').send({
        email: userOne.email,
        password: 'ThisIsNotAValidPassword'

    }).expect(400)
})

test('Should get Users Profile', async () => {
    await request(app).get('/user/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({}).expect(200)
})

test('should not get Users Profile if NOT Authenticated', async () => {
    await request(app).get('/user/me')
        .send().expect(401)
})

test('Should Delete Account for User', async () => {
    const response = await request(app).delete('/user/deleteMe')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)

    const user = await User.findOne({'tokens.token': response.body.token})
    expect(user).toBeNull()

})

test('Should NOT Delete Account Unauth USER', async () => {
    await request(app).delete('/user/deleteMe')
        .send().expect(401)
})

test('Should upload Image avatar', async () => {
    const response = await request(app).post('/user/me/uploadAvatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findOne({'tokens.token': response.body.tokens[0].token})
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update the user"s name', async () => {
  const response =  await request(app).patch('/user/updateMe')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Evangelion',
        })
        .expect(200)
    const user = await User.findOne({'tokens.token': response.body.tokens[0].token})
    expect(user.name).toBe(response.body.name)
})
test('Should fail to update inexistent fields ', async () => {
    const response =  await request(app).patch('/user/updateMe')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            Location: 'Mars',
        })
        .expect(400)
})