// require('dotenv').config();

const routes = require('express').Router();
const User = require('./models/User');
const MoedasEnviadas = require('./models/MoedasEnviadas');
const Yup = require('yup');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const configAuth = require('../auth');



routes.get("/", (req,res) => {
    return res.json({ Local: 'Raiz3'});
});

//Routes relacionadas ao Usuario
routes.get("/login", async (req,res) => {
    return res.json({ Local: 'Veioo'});

    // const { email, password } = req.body;

    // const usuario = await User.findOne({email: email});
    // if (!usuario){
    //     return res.status(401).json({
    //         error: true,
    //         code: 106,
    //         message: "Erro: Usuário ou Senha não confere!"
    //     })
    // }

    // if (!(await bcrypt.compare(password, usuario.password))){
    //     return res.status(401).json({
    //         error: true,
    //         code: 106,
    //         message: "Erro: Usuário/Senha não confere!"
    //     })
    // }

    // const token = jwt.sign({id: usuario._id}, configAuth.secret, {expiresIn: configAuth.expiresIn})

    // return res.json({
    //     error: false,
    //     user: {
    //         id: usuario.id,
    //         email
    //     },
    //     token
    // });
});

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



//Routes relacionadas a envioMoedas
routes.post("/moedas", async (req,res) => {
    const schema = Yup.object().shape({
        emailDestino: Yup.string()
            .required(),
        quantidadeMoeda: Yup.number()
            .required(),
        motivo: Yup.string()
            .required()
            // .min(15)
    });

    if (!(await schema.isValid(req.body))) {
         return res.status(401).json({
             error: true,
             code: 104,
             message: "Preencha todos os dados!"
         });
    }

    var saida = req.body;
    saida.email = "maxwel@puc.com.br"
    const moedasEnviadas = await MoedasEnviadas.create(saida, (err) => {
        if (err) return res.status(401).json({
            error: true,
            code: 101,
            message: "Operação não Realizada!"
        });
        return res.status(200).json({
            error: false,
            message: "Operação Realizada com sucesso!",
            dados: moedasEnviadas
        })
    });
});

routes.get("/somaEnviadas", async (req,res) => {
    await MoedasEnviadas.aggregate([{
        $project: { totalMoedas: {$sum: "$quantidadeMoeda"}}
    },
    {
         $group: {_id: null, totalMoedas: { $sum: "$totalMoedas" }}
    }]
    , (err, result) => {
        if (err) return res.status(401).json({
            error: true,
            code: 101,
            message: "Error: Erro ao cadastrar moedas recebidaaaaas!"
        })
        else {
            return res.json(result)
        }
    })
});


module.exports = routes;

