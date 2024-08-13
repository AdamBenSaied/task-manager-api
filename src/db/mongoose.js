const mongoose= require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {})
    .catch(err => console.log(err));






