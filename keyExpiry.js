// Authenticate User
require('dotenv').config()

const express = require('express');
const app = express();
const port = 8081;
const jwt = require('jsonwebtoken')
const keyStorage = require('./keyStorage');

const { authenticateToken, posts } = require('./app.js')

app.use(express.json())

keyStorage.generateNewKey(10);

app.get('/.known/jwks.json', (req, res) => 
{
    const jwks = 
    {
        keys: []
    };
    
    for (const [kid, keyData] of keyStorage.keys)
    {
        if(keyData.activeStatus && new Date() <= keyData.expiresIn)
        {
            jwks.keys.push
            ({
                kid: kid,
                kty: "oct",
                alg: "HS256",
                use: "sig",

                exp: Math.floor(keyData.expiresIn.getTime() / 1000)
            });
        }
    }
    res.json(jwks);
});

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
    const username = req.body.username;
    if (!username)
    {
        return res.status(400).json({ error: 'Username is required '})
    }
    
    const user = { name: username }
    const accessToken = generateToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

    const currentKey = keyStorage.getCurrentKey();
    const activeKeyID = keyStorage.activeKeyID;
    
    if(!currentKey)
    {
        return res.status(500).json({ error: 'No key available' });
    }

    const token = jwt.sign
    (
        user,
        currentKey,
        {
            expireIn: '10m',
            header: 
            {
                kid: activeKeyID,
                alg: 'H256'
            }
        }
    );

    res.json
    ({ 
        accessToken: accessToken, 
        refreshToken: refreshToken,
        keyID: activeKeyID,
        keyExpiresAt: keyStorage.keys.get(activeKeyID).expiresIn
    });

});

app.get('/posts', authenticateToken, (req, res) => 
{
    console.log('GET /post - User:' , req.user.name);

    const userPosts = posts.filter(post => post.username === req.user.name);

    res.json(userPosts);
})

app.post('/rotate-keys', (req, res) =>
{
    const newKeyID = keyStorage.generateNewKey(10);
    console.log(`Key rotated: ${newKeyID} is now active`);

    keyStorage.cleanupExpiredKeys();

    res.json({
        message: 'Keys rotated successfully',
        activeKeyID: keyStorage.activeKeyID,
        activeKeyExpires: keyStorage.keys.get(keyStorage.activeKeyID).expiresIn
    });

});

app.get('/key-status', (req, res) =>
{
    const status = [];
    for (const [id, key] of keyStorage.keys)
    {
        status.push({
            kid: id,
            createdAt: key.createdAt,
            expiresIn: key.expiresIn,
            activeStatus: key.activeStatus,
            isCurrent: id === keyStorage.activeKeyID,
            expired: new Date() > key.expiresAt

        });
    }
    res.json(status);

});
function generateToken(user)
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s'})
}

app.listen(port, () => 
{
    console.log(`Example app listening at http://localhost:${8081}`);
    console.log(`Using authenticateToken from app.js`);
});