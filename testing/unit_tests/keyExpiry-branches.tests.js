/* *************************************************
*  Name: Gustavo Alatriste
*  Assignment: Project One JWKS server
*  Purpose: Key Storage testing functions
*           using group tests and blocks to 
*           ensure proper POST, GET, token,
*           error, and key(ID) returns 
*           keyStorage.tests.js
************************************************* */

const request = require('supertest'); 
const { app } = require('../../keyExpiry'); 
const keyStorage = require('../../keyStorage'); 

jest.mock('../../keyStorage',()  => 
    ({
        generateNewKey: jest.fn(),
        getCurrentKey: jest.fn(),
        getCurrentKeyID: jest.fn(),
        getKey: jest.fn(),
        removeExpiredKeys: jest.fn(),
        keys: jest.fn(),
        activeKeyID: null
    }));

describe('keyExpiry.js - Branch Coverage Tests', () =>
{
    beforeEach(() => 
    {
        jest.clearAllMocks();
    });

    test('POST /token should handle invalid refresh token', async () =>
    {
        jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementationOnce((token, secret, cb) =>
        {
            cb(new Error('Invalid token'), null);
        })

        await request(app)
            .post('/token')
            .send({ token: 'some-token'})
            .expect(403);
    });

    test('POST /login should handle no key available', async () =>
    {
        keyStorage.getKey.mockReturnValue(null);

        const response = await request(app)
            .post('/login')
            .send({ username: 'Nanna' })
            .expect(500);

        expect(response.body.error).toBe('No key available');
    });

    test('POST /rotate-keys should handle errors', async () =>
    {
        keyStorage.generateNewKey.mockImplementationOnce( () => 
        {
            throw new Error('Test error');
        });

        const response = await request(app)
            .post('/rotate-keys')
            .send({ expiresInDays: 1 })
            .expect(500);

        expect(response.body.error).toBe('Failed to rotate keys');
    });

    test('GET /key-status should handle empty keys', async () =>
    {
        keyStorage.keys.clear();

        const response = await request(app)
            .get('/key-status')
            .expect(500);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    test('Should return 403 for expired token', async () =>
    {
        keyStorage.getKey.mockReturnValue('valid-secret');

        const token = jwt.sign(
            { name: 'Nanna' }, 
            'valid-secret',
            { 
                expiresIn: '-10s',
                header: { kid: 'test-key-id', alg: 'HS256' } 
            }
        );

        const response = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(403);

        expect(response.body.error).toBe('Token Expired');
    });

    test('Should return 200 with posts for valid tokens', async () =>
    {
        keyStorage.getKey.mockReturnValue('valid-secret');

        const token = jwt.sign(
            { name: 'Nanna' }, 
            'valid-secret',
            { 
                expiresIn: '15s',
                header: { kid: 'test-key-id', alg: 'HS256' } 
            }
        );

        const response = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].username).toBe('Nanna');
    });

    test('Should return 401 for malformed authorization header', async () =>
    {
        await request(app)
            .get('/posts')
            .set('Authorization', 'Bearer')
            .expect(401);
    });

    test('Should return 401 for no authorization header', async () =>
    {
        await request(app)
            .get('/posts')
            .expect(401);
    });
});
