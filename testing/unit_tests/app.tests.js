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

    test('getCurrentKey returning active key', () =>
    {
        keyStorage.generateNewKey(1);
        const currentKey = keyStorage.getCurrentKey();

        expect(currentKey).toBeDefined();
        expect(typeof currentKey === 'string' || currentKey === null).toBe(true);
        if(currentKey)
        {
            expect(currentKey.length).toBe(128);
        }    
    });
});