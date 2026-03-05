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
const jwt = require('jsonwebtoken'); 
const { app } = require('../../app'); 

jest.mock('../../keyStorage',()  => 
    ({
        getKey: jest.fn(),
        getCurrentKey: jest.fn(),
        getCurrentKeyID: jest.fn(),
    }));

const keyStorage = require('../../keyStorage'); 

describe('app.js - Authentication middleware', () =>
{
    beforeEach(() => 
    {
        jest.clearAllMocks();
    });

    test('AuthenticateToken test for handling verfication errors', async () =>
    {
        keyStorage.getKey.mockReturnValue('valid-secret');

        const token = jwt.sign(
            { name: 'Nanna' }, 
            'wrong=secret',
            { 
                expiresIn: '15s',
                header: { kid: 'test-key-id', alg: 'HS256' } 
            }
        );

        const response = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(403);

        expect(response.body.error).toBe('Invalid Token');
           
    });

    test('App.js file must successfully export without starting the server', async () =>
    {
        expect(app).toBeDefined();
        expect(authenticateToken).toBeDefined();
        expect(typeof authenticateToken).toBe('function');
        expect(posts).toBeDefined();
        expect(Array).toHaveProperty(true);
        expect(posts.length).toBe(2);
 
           
    });

    test('AuthenticateToken test for handling verfication errors', async () =>
    {
        keyStorage.getKey.mockReturnValue(null);

        const token = jwt.sign(
            { name: 'Nanna' }, 
            'some=secret',
            { header: { kid: 'non-existent', alg: 'HS256' } }
        );

        const response = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(401);

        expect(response.body.error).toBe('Key Invalid');
           
    });

});