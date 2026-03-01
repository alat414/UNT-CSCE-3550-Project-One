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
    
    test('Must return JWK format with active valid keys', async () =>
    {
        const response = await request(app)
            .post('/.well-known/jwks.json')
            .expect(200);
                
        expect(response.body.error).toHaveProperty('keys');
        expect(Array.isArray(response.body.keys)).toBe(true);

        if(response.body.length > 0)
        {
            const key = response.body[0];
            expect(key).toHaveProperty('kid');
            expect(key).toHaveProperty('kty', 'oct');
            expect(key).toHaveProperty('alg', 'HS256');
            expect(key).toHaveProperty('use', 'sig');
            expect(key).toHaveProperty('exp');
        }
    });
});