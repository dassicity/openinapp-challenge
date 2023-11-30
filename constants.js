const auth = {
    type: 'OAuth2',
    user: 'babisoumyanildas@gmail.com',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: process.env.REFRESH_TOKEN,
}

module.exports = { auth };