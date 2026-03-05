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
        getKey: jest.fin(),
        getCurrentKey: jest.fin(),
        getCurrentKeyID: jest.fin(),
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
        const token = jwt.sign({ name: 'Nanna' }, 'wrong=secret');

        const response = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(403);

        expect(response.body.error).toBe('Invalid token');
           
    });
});