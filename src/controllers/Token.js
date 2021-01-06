const jwt = require('jsonwebtoken');
const configAuth = require('../../auth');

//Valida token
const validateToken = (req, res, next) => {
    const token = req.body.token || ''
    jwt.verify(token, configAuth.secret, function (err, decoded) {
        return res.status(200).send({ valid: !err })
    })
}

module.exports = { validateToken }
