const MoedasEnviadas = require('../models/MoedasEnviadas');
const User = require('../models/User');
const _ = require('lodash')

//Envio de moedas
const EnvioCoins = async (req, res) => {
    const { emailDestino, quantidadeMoeda, motivo } = req.body;

    if (!emailDestino)
        return res.status(400).send({ errors: ['Informe o usuário destino'] })
    if (!quantidadeMoeda)
        return res.status(400).send({ errors: ['Informe a quantidade de moedas'] })
    if (quantidadeMoeda <= 0)
        return res.status(400).send({ errors: ['Informe uma quantidade maior que zero'] })
    if (!motivo)
        return res.status(400).send({ errors: ['Informe o motivo'] })

    const usuarioOrigemExiste = await User.findOne({ email: req.headers['x-tenant-id'] });
    if (!usuarioOrigemExiste)
        return res.status(400).send({ errors: ['Usuário origem não encontrado para atualizar o Saldo'] })
    if (!usuarioOrigemExiste.quantidadeMensal || quantidadeMoeda > usuarioOrigemExiste.quantidadeMensal)
        return res.status(400).send({ errors: ['Saldo insuficiente para efetuar a doação'] })
    const usuarioDestinoExiste = await User.findOne({ email: emailDestino });
    if (!usuarioDestinoExiste)
        return res.status(400).send({ errors: ['Usuário destino não encontrado para atualizar o Saldo'] })

    const newMoedasEnviadas = new MoedasEnviadas({ email: req.headers['x-tenant-id'], emailDestino, quantidadeMoeda, motivo })
    await newMoedasEnviadas.save(err => {
        if (err)
            return sendErrorsFromDB(res, err)
    })

    const quantidadeMensalOrigem = parseInt(usuarioOrigemExiste.quantidadeMensal) - parseInt(quantidadeMoeda);
    await User.updateOne({ email: req.headers['x-tenant-id'] }, { quantidadeMensal: quantidadeMensalOrigem }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    });

    const quantidadeTotalDestino = parseInt(usuarioDestinoExiste.quantidadeTotal) + parseInt(quantidadeMoeda);
    await User.updateOne({ email: emailDestino }, { quantidadeTotal: quantidadeTotalDestino }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    });


    res.json(newMoedasEnviadas)
};

//Get saldos atual usuario
const GetSaldo = async (req, res) => {
    const usuarioExiste = await User.findOne({ email: req.headers['x-tenant-id'] }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    });
    if (!usuarioExiste)
        return res.status(400).send({ errors: ['Usuário não encontrado'] })

    const { quantidadeMensal, quantidadeTotal } = usuarioExiste
    return res.json({ quantidadeMensal, quantidadeTotal })
};

//Lista todas as doações por filtro
const GetMoedas = async (req, res) => {

    const dataDoacao = req.body.dataDoacao || ''
    const emailEmissor = req.body.emailEmissor || ''
    const emailDestino = req.body.emailDestino || ''

    var moedas = [];

    if (dataDoacao) {
        moedas = await MoedasEnviadas.find({
            createdAt: {
                $gte: new Date(new Date(JSON.stringify(dataDoacao)).setHours(00, 00, 00)),
                $lt: new Date(new Date(JSON.stringify(dataDoacao)).setHours(23, 59, 59))
            }
        }).sort({ createdAt: 'desc'})
    }
    else {
        moedas = await MoedasEnviadas.find({}, (err) => {
            if (err)
                return sendErrorsFromDB(res, err)
        }).sort({ "createdAt": -1 })
    }

    if (emailEmissor) {
        moedas = moedas.filter((m) => {
            return m.email === emailEmissor;
        })
    }

    if (emailDestino) {
        moedas = moedas.filter((m) => {
            return m.emailDestino === emailDestino;
        })
    }
    return res.json({ moedas })
};

//Lista as Moedas recebidas, por ordem decrescente de data
const GetMoedasRecebidas = async (req, res) => {
    let moedasRecebidas = await MoedasEnviadas.find({ emailDestino: req.headers['x-tenant-id'] }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    }).sort({ "createdAt": -1 })
    return res.json({ moedasRecebidas })
};

//Lista as Moedas enviadas, por ordem decrescente de data
const GetMoedasEnviadas = async (req, res) => {
    let moedasEnviadas = await MoedasEnviadas.find({ email: req.headers['x-tenant-id'] }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    }).sort({ "createdAt": -1 })

    return res.json({ moedasEnviadas })
};

//Resgata saldo Mensal
const SetSaldoMensal = async (req, res) => {
    const { emailUsuario } = req.body;
    const usuarioExiste = await User.findOne({ email: emailUsuario }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    });
    if (!usuarioExiste)
        return res.status(400).send({ errors: ['Usuário não encontrado'] })

    const { email, mesResgate, anoResgate } = usuarioExiste;
    const now = new Date;
    if (mesResgate == now.getMonth() && anoResgate == now.getFullYear())
        return res.status(400).send({ errors: ['Resgate já efetuado esse mês.'] });

    let quantidadeMensal = 100;
    await User.updateOne({ email }, { quantidadeMensal, mesResgate: now.getMonth(), anoResgate: now.getFullYear() }, (err) => {
        if (err)
            return sendErrorsFromDB(res, err)
    });
    return res.json({ quantidadeMensal });
};

//teste aggregate, nao usado
const SomaMoedas = async (req, res) => {
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
            message: "Error: Erro ao agrupar moedas!"
        })
        else {
            return res.json(result)
        }
    })
};

//Retorno de erros do banco
const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({ errors })
}

module.exports = { EnvioCoins, GetSaldo, GetMoedasEnviadas, GetMoedasRecebidas, GetMoedas, SetSaldoMensal }
