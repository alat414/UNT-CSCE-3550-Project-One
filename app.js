require('dotenv').config()

const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken')

app.use(express.json())
app.get('/posts', authenticateToken, (req, res) => 
{
    res.json(posts);

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
    

}
app.listen(port, () => 
{
    console.log(`Example app listening at http://localhost:${8080}`);
});
