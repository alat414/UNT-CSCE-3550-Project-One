/* *************************************************
*  Name: Gustavo Alatriste
*  Assignment: Project One JWKS server
*  Purpose: Authentication testing functions
*           using group tests and blocks to 
*           ensure proper POST, GET, token,
*           error, and key (ID) returns 
*           authentication-flow.tests.js
************************************************* */


/* *************************************************
*  Importing a local module in both 
*  testing environment and 
*  key testing functions.
************************************************* */
const {request, app } = require('../setup/testsEnvironment');
const { VALID_USERS, INVALID_USERS, EXPECTED_POSTS } = require('../fixture_tests/test-keys');


describe('Authentication Flow', () => 
{
    describe ('POST /login', () =>
    {
        test('Must return 400 if the username is missing', async () =>
        {
            const response = await request(app)
                .post('/login')
                .send({})
                .expect(400);

            expect(response.body.error).toBe('Username is required');
        });

        test('Must return 401 if the username is invalid', async () =>
        {
            for (const invalidUser of INVALID_USERS)
            {
                const response = await request(app)
                    .post('/login')
                    .send({ username: invalidUser})
                    .expect(401);
                
                expect(response.body.error).toBe('Username is unauthorized');
                expect(response.body.message).toBe('Username is invalid');

            }
        });
    })

})