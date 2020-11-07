const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const configAuth = require('../../auth');

//Verificacao de usuario e senha, gera Token
const Login = async (req,res) => {
     const { email, password } = req.body;

     const usuario = await User.findOne({email: email});
     if (!usuario){
         return res.status(401).json({
             error: true,
             code: 106,
             message: "Erro: Usuário ou Senha não confere!"
         })
     }

     if (!(await bcrypt.compare(password, usuario.password))){
         return res.status(401).json({
             error: true,
             code: 106,
             message: "Erro: Usuário/Senha não confere!"
         })
     }

     const token = jwt.sign({id: usuario._id}, configAuth.secret, {expiresIn: configAuth.expiresIn})

     return res.json({
         error: false,
         user: {
             msg: 'nv ver',
             id: usuario.id,
             email
         },
         token
     });
};

//Valida token
const validateToken = (req, res, next) => {
    const token = req.body.token || ''

    jwt.verify(token, configAuth.secret, function (err, decoded) {
        return res.status(200).send({ valid: !err })
    })
}

module.exports = { Login, validateToken }
