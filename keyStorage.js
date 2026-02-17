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
    }

}
