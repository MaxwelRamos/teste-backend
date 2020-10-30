const mongoose = require('mongoose');

const MoedasEnviadas = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    emailDestino: {
        type: String,
        required: true
    },
    quantidadeMoeda: {
        type: Number,
        required: true
    },
    motivo: {
        type: String,
        required: true
    }    
},
{
    timestamps: true,
});

module.exports = mongoose.model("moedasEnviadas", MoedasEnviadas)