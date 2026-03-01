/* *************************************************
*  Name: Gustavo Alatriste
*  Assignment: Project One JWKS server
*  Purpose: Key Storage testing functions
*           using group tests and blocks to 
*           ensure proper POST, GET, token,
*           error, and key(ID) returns 
*           keyStorage.tests.js
************************************************* */

const keyStorage = require('../../keyStorage'); 

describe('KeyStorage Unit tests', () =>
{
    beforeEach(() => 
    {
        keyStorage.keys.clear();
        keyStorage.activeKeyID = null;
    });

    test('The function generateNewKey must create a valid key', async () =>
    {
        const keyID = keyStorage.generateNewKey(1);
        expect(keyID).toBeDefined();
        expect(keyStorage.keys.size).toBe(1);

        const key = keyStorage.keys.get(keyID);
        expect(key.id).toBe(keyID);
        expect(key.secret).toBeDefined();
        expect(key.secret.length).toBe(128);
        expect(key.isActive).toBe(true);
        expect(key.createdAt).toBeInstanceOf(Date);
        expect(key.expiresIn).toBeInstanceOf(Date);
        
    });
    
    test('getKey returning null for an expired key', async () =>
    {
        const keyID = keyStorage.generateNewKey(0.0000001);

        await new Promise(resolve => setTimeout(resolve, 100));

        const secret = keyStorage.getKey(keyID);
        expect(secret).toBeNull();

        const key = keyStorage.keys.get(keyID);
        expect(key.isActive).toBe(false);
    });

    test('getCurrentKey returning active key', () =>
    {
        keyStorage.getCurrentKey(1);
        const currentKey = keyStorage.getCurrentKey();

        expect(currentKey).toBeDefined();
        expect(typeof currentKey).toBe('string');
        expect(currentKey.length).toBe(128);
    });

    test('Clean up expired keys in removeExpiredKeys', async () =>
    {
        keyStorage.generateNewKey(0.0000001);
        keyStorage.generateNewKey(1);
        keyStorage.generateNewKey(1);

        await new Promise(resolve => setTimeout(resolve, 100));

        const removed = keyStorage.removeExpiredKeys();
        expect(removed).toBe(1);
        expect(keyStorage.keys.size).toBe(2);
    });

    test('Deactivate key should be set to inactive', () =>
    {
        const keyID = keyStorage.generateNewKey(1);

        keyStorage.deactivateKey(keyID);

        const key = keyStorage.keys.get(keyID);
        expect(key.isActive).toBe(false);
    });

    
});