require('dotenv').config();
const session = require('express-session')
const methodOveride = require('method-override')
const express = require('express')
const app = express()


app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/Male-Fashion')

app.use(session({
    secret: 'thisismysecret',
    resave: false, 
    saveUninitialized: false
}))

app.use(methodOveride("_method"))

const userRoute = require('./router/userRouter');
const adminRoute = require('./router/adminRouter')

app.use('/', userRoute)
app.use('/admin', adminRoute)


app.listen(3000,()=>{
    console.log('server is running');
})