// Authenticate User
require('dotenv').config()

const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken')
const keyStorage = require('./keyStorage');

const { authenticateToken, posts } = require('./app.js')

app.use(express.json())

keyStorage.generateNewKey(10);

app.get('/.well-known/jwks.json', (req, res) => 
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
    console.log(` Returning ${jwks.keys.length} active keys`);
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
    const currentKey = keyStorage.getCurrentKey();
    const activeKeyID = keyStorage.activeKeyID;
    
    if(!currentKey)
    {
        return res.status(500).json({ error: 'No key available' });
    }

    const accessToken = jwt.sign
    (
        user,
        currentKey,
        {
            expiresIn: '30s',
            header: 
            {
                kid: activeKeyID,
                alg: 'HS256'
            }
        }
    );

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret');

    res.json
    ({ 
        accessToken: accessToken, 
        refreshToken: refreshToken,
        keyID: activeKeyID,
        keyExpiresIn: keyStorage.keys.get(activeKeyID).expiresIn
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
    try
    {
        console.log(`Rotating keys:`);
        const days = req.body.expiresInDays || 1;
        
        const newKeyID = keyStorage.generateNewKey(days);
        console.log(`New keys generated: ${newKeyID}`);

        const cleanedCount = keyStorage.removeExpiredKeys();
        console.log(`Cleaned up keys : ${cleanedCount}`);

        const activeKeyData = keyStorage.getKeyData(keyStorage.activeKeyID);

        res.json
        ({
            success: true,
            message: 'Keys rotated successfully',
            newKeyID: newKeyID,
            activeKeyID: keyStorage.activeKeyID,
            activeKeyExpires: activeKeyData ? activeKeyData.expiresIn : null,
            cleanedupKeys: cleanedCount
        });
    }
    catch(error)
    {
        console.error('Error rotating keys:', error);
        res.status(500).json
        ({
            error: "Failed to rotate keys",
            details: error.message
        });
    }

});

app.get('/key-status', (req, res) =>
{
    const status = [];
    for (const [id, key] of keyStorage.keys)
    {
        status.push
        ({
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

app.get('/health', (req, res) =>
{
    res.json
    ({
        status: 'OK',
        timestamp: new Date(),
        activeKeyID: keyStorage.activeKeyID,
        keyCount: keyStorage.keys.size
    });
});

function generateToken(user)
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s'})
}

app.listen(port, () => 
{
    console.log(`Using authenticateToken from app.js`);

    console.log
    (`
        KeyExpiry server running at http://localhost:${port}
        Available endpoints:
        - GET /health
        - GET /.well-known/jwks.json
        - GET /key-status
        - POST /login
        - POST /token
        - GET /posts
        - POST /rotate-keys
    
    `);
});