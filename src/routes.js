const routes = require('express').Router();

const User = require('./models/User');

routes.get("/", (req,res) => {
    return res.json({ Local: 'Raiz'});
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


module.exports = routes;

