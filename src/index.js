const express = require('express');
const app = express();
require('./db/mongoose')
const port = process.env.PORT;

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.listen(port, () => console.log(`Listening on port ` + port));
