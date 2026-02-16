// Authenticate User
require('dotenv').config()

const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken')

app.use(express.json())

app.post('/login', (req, res) => 
{
    const username = req.body.username
    const user = { name: username }

    const accessToken = generateToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    res.json({ accessToken: accessToken});

});

function generateToken(user)
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s'})
}