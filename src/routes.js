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
routes.get('/getSaldo', authMiddleware, CoinController.GetSaldo);
routes.get('/moedasEnviadas', authMiddleware, CoinController.GetMoedasEnviadas); 
routes.get('/moedasRecebidas', authMiddleware, CoinController.GetMoedasRecebidas); 
routes.post('/moedas', authMiddleware, CoinController.GetMoedas); 
routes.post('/setSaldoMensal', authMiddleware, CoinController.SetSaldoMensal); 

//Rota responsavel por validar o Token
routes.post('/validateToken', TokenController.validateToken); 

module.exports = routes;

