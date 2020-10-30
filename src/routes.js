const routes = require('express').Router();
const User = require('./models/User');
const Yup = require('yup');
const bcrypt = require('bcryptjs');

routes.get("/", (req,res) => {
    return res.json({ Local: 'Raiz'});
});

//Routes relacionadas ao Usuario
routes.get("/users", async (req,res) => {
    await User.find({}).select("-password").then((users) => {
        return res.json({
            error: false,
            users: users
        });
    }).catch((erro) => {
        return res.status(400).json({
            error: true,
            code: 106,
            message: "Erro: Não foi possível executar a solicitação!"
        });
    });
});

routes.post("/users", async (req,res) => {
    const schema = Yup.object().shape({
        name: Yup.string()
            .required(),
        email: Yup.string()
            .email()
            .required(),
        password: Yup.string()
            .required()
            .min(6)
    });

    if (!(await schema.isValid(req.body))) {
        return res.status(401).json({
            error: true,
            code: 101,
            message: "Error: Dados inválidos!"
        });
    }

    const emailExiste = await User.findOne({ email: req.body.email });
    if (emailExiste) {
        return res.status(401).json({
            error: true,
            code: 102,
            message: "Error: Este e-mail já está cadastrado!"
        });
    }

    var dados = req.body;
    dados.password = await bcrypt.hash(dados.password, 7);

    const user = await User.create(dados, (err) => {
        if (err) return res.status(401).json({
            error: true,
            code: 103,
            message: "Error: Usuário não foi cadastrado com sucesso!"
        });

        return res.status(200).json({
            error: false,
            message: "Usuário cadastrado com sucesso!",
            dados: user
        })
    });
});



module.exports = routes;

