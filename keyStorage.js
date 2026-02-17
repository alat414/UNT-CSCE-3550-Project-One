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
        expiresAt.setDate(expiresAt.getDate() + expiresInMinutes);

        const keyData =
        {
            id: keyID,
            secretMessage: secret,
            createdTime: new Date(),
            expiringTime: expiresAt,
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

}
