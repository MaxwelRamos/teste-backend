const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    quantidadeMensal: {
        type: Number,
    },
    mesResgate: {
        type: Number,
    },
    anoResgate: {
        type: Number,
    },
    quantidadeTotal: {
        type: Number,
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model("user", User)