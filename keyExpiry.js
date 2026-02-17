// Authenticate User
require('dotenv').config()

const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken')

const { authenticateToken, posts } = require('./app.js')

app.use(express.json())

const posts = 
[
    {
        username: 'Nanna',
        title: 'lead singer'
    },
    {
        username: 'Raggi',
        title: 'lead singer two'
    }

]

app.post('/token', (req, res) =>
{
    const refreshToken = req.body.token

    if (!refreshToken) 
    {
        return res.sendStatus(401)
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
        {
            return res.sendStatus(403)
        }
        const accessToken = generateToken({ name: user.name})
        res.json({ accessToken: accessToken})
    })
})

app.post('/login', (req, res) => 
{
    const username = req.body.username
    if (!username){
        return res.status(400).json({ error: 'Username is required '})
    }
    
    const user = { name: username }
    const accessToken = generateToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    
    res.json({ accessToken: accessToken, refreshToken: refreshToken});

});

function generateToken(user)
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s'})
}

app.listen(port, () => 
{
    console.log(`Example app listening at http://localhost:${8080}`);
    console.log(`Using authenticateToken from app.js`);
});