require('dotenv').config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require('mongoose');
const cors = require("cors");

const app = express();

mongoose.connect(
    process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log("Conexão com MongoDB realizada com sucesso!")
}).catch((erro) => {
    console.log("Erro: Conexão com MongoDB não foi realizado com sucesso: " + erro)
})

console.log(process.env.HOST);
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(require('./routes'));

// app.listen(3000);

app.listen(port, host, () => {
    console.log("Servidor iniciado.");
})