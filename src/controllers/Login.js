const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const configAuth = require('../../auth');
const _ = require('lodash')

//Verificacao de email e senha, gera Token
const Login = async (req,res) => {
    const { email, password } = req.body;

    if (!email)
        return res.status(400).send({ errors: ['Informe o e-mail'] })
    if (!password)
        return res.status(400).send({ errors: ['Informe a senha'] })

    User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({id: user._id}, configAuth.secret, {
                expiresIn: configAuth.expiresIn
            })

            const { name, email } = user
            res.json({ name, email, token })
        } else {
            return res.status(400).json({ errors: ['Usuário/Senha inválidos'] })
        }
    })
};

//Criacao do usuario
const signup = async (req,res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name)
        return res.status(400).send({ errors: ['Informe o nome'] })
    if (!email)
        return res.status(400).send({ errors: ['Informe o e-mail'] })
    if (!password)
        return res.status(400).send({ errors: ['Informe a senha'] })
    if (!confirmPassword)
        return res.status(400).send({ errors: ['Informe a Confirmação da senha'] })
    if (password !== confirmPassword)
        return res.status(400).send({ errors: ['Senhas não conferem'] })

    const passwordHash = bcrypt.hashSync(password, 7);
    await User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (user) {
            return res.status(400).send({ errors: ['Usuário já cadastrado.'] })
        } else {
            const newUser = new User({ name, email, password: passwordHash, quantidadeMensal: 0, quantidadeTotal: 0 })
            newUser.save(err => {
                if (err) {
                    return sendErrorsFromDB(res, err)
                } else {
                    Login(req, res)
                }
            })
        }
    })
};

//Lista os usuarios
const Users = async (req,res) => {
    await User.find({}).select("-password").then((users) => {
        return res.json({
            users: users
        });
    }).catch((err) => {
        return sendErrorsFromDB(res, err)
    });
};

//Retorno de erros do banco
const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({ errors })
}

module.exports = { Login, signup, Users }
