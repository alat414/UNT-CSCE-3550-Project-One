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


