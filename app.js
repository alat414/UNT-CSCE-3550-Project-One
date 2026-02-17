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

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken});

});

function authenticateToken(req, res, nex)
{
    const authHeader = req.headers['authorization'] 
    const token = authHeader && authHeader.split(' ')[1]
    
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => 
    {
        if (err) return res.sendStatus(403)
        req.user = user
        nex() 
    })

}

module.exports = 
{
    app, 
    authenticateToken,
    posts
}
app.listen(port, () => 
{
    console.log(`Example app listening at http://localhost:${8080}`);
});
