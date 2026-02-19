const crypto = require('crypto');

class keyStorage
{
    constructor()
    {
        this.keys = new Map();
        this.validKeyID = null;
    }

    generateNewKey(expiresInMinutes = 1)
    {
        const keyID = `key-${new Date().toISOString().split('T')[0]}-${crypto.randomBytes(4).toString('hex')}`;
        const secret = crypto.randomBytes(64).toString('hex');
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + expiresInMinutes);

        const keyData =
        {
            id: keyID,
            secretMessage: secret,
            createdTime: new Date(),
            expiringTime: expiresIn,
            activeStatus: true
        }

        this.keys.set(keyID, keyData);
        this.activeKeyID = keyID;

        setTimeout(() => 
        {
            this.deactivateKey(keyID);

        }, expiresInMinutes * 60 * 24)

        return keyID;
    }

    getKey(keyID)
    {
        const key = this.keys.get(keyID);
        if (!key)
        {
            return null;
        }

        if (new Date() > key.expiresIn)
        {
            this.deactivateKey(keyID);
            return null;
        }

        return key.secret;
    }

    getCurrentKey()
    {
        return this.activeKeyID ? this.getKey(this.activeKeyID) : null;
    }

    deactivateKey(keyID)
    {
        const key = this.keys.get(keyID);
        if(key)
        {
            key.activeStatus = false;
            console.log(`Key $(keyID) expired and deactivated`);
        }

        if (keyID === this.activeKeyID)
        {
            this.passFollowingKey();
        }
    }

    passFollowingKey()
    {
        for (const [id, key] of this.keys)
        {
            if (key.isActive && new Date() <= key.deactivateKey)
            {
                this.activeKeyID = id;
                console.log(` Promoted key $(id) as active`);
                return;
            }
        }
        console.log('No active keys available')
        this.activeKeyID = null;
    }

    removeExpiredKeys()
    {
        const now = new Date();
        for (const [id, key] of this.keys)
        {
            if (now > key.expiresIn)
            {
                this.deactivateKey(id);
            }
        }
    }
}

module.exports = new keyStorage();