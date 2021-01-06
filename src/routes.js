// require('dotenv').config();

const routes = require('express').Router();
const authMiddleware = require('./middlewares/token');
const LoginController = require('./controllers/Login');
const CoinController = require('./controllers/Coin');
const TokenController = require('./controllers/Token');

routes.get("/", (req,res) => {
    return res.json({ Local: 'Raiz4'});
});

//Routes relacionadas ao Usuario
routes.post('/login', LoginController.Login); 
routes.post('/signup', LoginController.signup); 
routes.get('/users', LoginController.Users); 

//Routes relacionadas a Moedas
routes.post('/envioCoins', authMiddleware, CoinController.EnvioCoins); 
routes.get('/getSaldo', CoinController.GetSaldo);
routes.get('/moedasEnviadas', CoinController.GetMoedasEnviadas); 
routes.get('/moedasRecebidas', CoinController.GetMoedasRecebidas); 
routes.post('/moedas', CoinController.GetMoedas); 
routes.post('/setSaldoMensal', CoinController.SetSaldoMensal); 

//Rota responsavel por validar o Token
routes.post('/validateToken', TokenController.validateToken); 

module.exports = routes;

