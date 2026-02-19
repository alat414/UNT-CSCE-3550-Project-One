require('dotenv').config()

const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken')

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
app.get('/posts', authenticateToken, (req, res) => 
{
    res.json(posts.filter(post => post.username === req.user.name));

});

app.post('/login', (req, res) => 
{
    const username = req.body.username
    const user = { name: username }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s'})
    res.json({ accessToken: accessToken});

});

function authenticateToken(req, res, next)
{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid)
    {
        return res.status(401).json({ error: 'No key ID in token' });
    }

    const keyID = decodedHeader.header.kid;

    const signingKey = keyStorage.getKey(keyID);

    if(!signingKey)
    {
        return res.status(401).json
        ({
            error: 'Key invalid',
            message: 'Token was signed with invalid key, retry.'
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => 
    {
        if (err) return res.sendStatus(403)
        req.user = user
        next() 
    })

}

module.exports = 
{
    app, 
    authenticateToken,
    posts
}

