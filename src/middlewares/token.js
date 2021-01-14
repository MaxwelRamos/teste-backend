const jwt = require('jsonwebtoken');
const auth = require('../../auth');
const configAuth = require('../../auth');

module.exports = (req, res, next) => {
    const authHeader = req.body.token || req.query.token || req.headers['authorization']

    if (!authHeader) {
        return res.status(403).send({ errors: ['No token provided.'] })
    }

    // const [, token] = authHeader.split(' ');
    jwt.verify(authHeader, configAuth.secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                token,
                errors: ['Failed to authenticate token.']
            })
        } else {
            // passar para outros middlewares a frente
            // req.decoded = decoded 
            next()
        }
    })    
}