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
const jwt = require('jsonwebtoken');

jest.mock('../../keyStorage',()  => 
    ({
        generateNewKey: jest.fn(),
        getCurrentKey: jest.fn(),
        getCurrentKeyID: jest.fn(),
        getKey: jest.fn(),
        removeExpiredKeys: jest.fn(),
        keys:
        {
            size: 0,
            values: jest.fn().mockReturnValue([]),
            [Symbol.iterator]: jest.fn().mockReturnValue([])
        },
        activeKeyID: null
    }));

describe('keyExpiry.js - Branch Coverage Tests', () =>
{
    beforeEach(() => 
    {
        jest.clearAllMocks();

        keyStorage.getCurrentKey.mockReturnValue('test-secret');
        keyStorage.getCurrentKeyID.mockReturnValue('test-key-id');
        keyStorage.generateNewKey.mockReturnValue('new-key-id');
        keyStorage.removeExpiredKeys.mockReturnValue(0);
    });

    test('POST /token should handle invalid refresh token', async () =>
    {
        jest.spyOn(jwt, 'verify').mockImplementationOnce((token, secret, cb) =>
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
        const response = await request(app)
            .get('/key-status')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    test('Function generateToken should handle missing key', async () =>
    {
        keyStorage.getCurrentKey.mockReturnValue(null);

        expect(() => 
        {
            const { generateToken } = require('../../keyExpiry');
        }).not.toThrow();
    });
});
