const mongoose = require("mongoose")

async function setup(uri) {
    mongoose.set('strictQuery', false)
    mongoose.connect(uri)
        .catch(error => console.log(error));

    console.log("🟣 | Banco conectado")
    var database = mongoose.connection
}

mongoose.connection.on('error', err => {
    console.log("🔴 | Erro com o Banco")

    console.log(err)
})

module.exports.setup = setup