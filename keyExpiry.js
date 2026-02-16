// Authenticate User

function generateToken(user)
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s'})
}