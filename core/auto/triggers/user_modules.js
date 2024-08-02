const { writeFileSync, readFile } = require('fs')

const { getUser } = require('../../database/schemas/User.js')
const { getActiveModules, shutdownAllUserModules } = require("../../database/schemas/User_modules.js")

const { week_days } = require('../../formatters/patterns/user.js')

const formata_horas = require('../../formatters/formata_horas.js')

const lista_modulos = []
let trava_modulo = false

async function atualiza_modulos() {

    const dados = await getActiveModules()

    writeFileSync("./files/data/user_modules.txt", JSON.stringify(dados))
}

async function requisita_modulo(client) {

    const data1 = new Date()
    const horario = formata_horas(data1.getHours() === 0 ? '0' : data1.getHours(), data1.getMinutes() === 0 ? '0' : data1.getMinutes()), dia = data1.getDay()

    readFile('./files/data/user_modules.txt', 'utf8', (err, data) => {
        // Interrompe a operação caso não haja módulos salvos em cache
        if (err || data === undefined || data.length < 1) return

        data = JSON.parse(data)

        for (let i = 0; i < data.length; i++) {
            // Verificando se o horário está correto
            if (data[i].stats.days === 2 && data[i].stats.hour === horario)
                lista_modulos.push({
                    uid: data[i].uid,
                    type: data[i].type
                })

            // Verificando se o horário e o dia estão corretos
            else if (data[i].stats.days < 4 && (data[i].stats.hour === horario && week_days[data[i].stats.days].includes(dia)))
                lista_modulos.push({
                    uid: data[i].uid,
                    type: data[i].type
                })

            else if (data[i].stats.days > 2 && data[i].stats.hour === horario)
                if ((data[i].stats.days - 4) === dia) // Um dia específico
                    lista_modulos.push({
                        uid: data[i].uid,
                        type: data[i].type
                    })
        }

        if (lista_modulos.length > 0)
            executa_modulo(client)
    })
}

executa_modulo = async (client) => {

    // Retorna caso o array de módulos esteja vazio
    if (lista_modulos.length < 1) return

    // Dispara os módulos agendados
    if (!trava_modulo) {
        trava_modulo = true

        const user = await client.getUser(lista_modulos[0].uid, {
            conf: true,
            misc: true
        })

        if (lista_modulos[0].type === 0)
            await require('../../formatters/chunks/model_weather.js')(client, user)

        if (lista_modulos[0].type === 1)
            await require('../../formatters/chunks/model_frase.js')(client, user)

        if (lista_modulos[0].type === 2) {

            if (lista_modulos[0].data === 0) // Sem definição de tipo de envio
                await client.sendDM(user.id, { content: client.tls.phrase(user, "misc.modulo.faltando_tipo") }, true)

            // Definindo qual tipo de anúncio do history será
            let dados = {
                data: "",
                especifico: "acon=1"
            }

            // History resumido
            if (lista_modulos[0].data === 2 || !lista_modulos[0].data) {
                dados = {
                    data: "",
                    especifico: "acon=1"
                }
            }

            await require('../../formatters/chunks/model_history.js')(client, user, dados)
        }

        // Charadas
        if (lista_modulos[0].type === 3)
            await require('../../formatters/chunks/model_charada.js')(client, user)

        // Curiosidades
        if (lista_modulos[0].type === 4)
            await require('../../formatters/chunks/model_curiosidades.js')(client, user)

        // Um item do minecraft
        if (lista_modulos[0].type === 5)
            await require('../../formatters/chunks/model_mine.js')(client, user)

        // Jogos gratuitos do momento
        if (lista_modulos[0].type === 6)
            await require('../../formatters/chunks/model_free_games.js')(client, user)

        lista_modulos.shift()

        setTimeout(() => {
            trava_modulo = false

            if (lista_modulos.length > 0)
                executa_modulo(client)
        }, 5000)
    }
}

async function cobra_modulo(client) {

    const users = {}, modules = {}, data1 = new Date()
    const active_modules = await getActiveModules()

    // Somando todos os módulos ativos em chaves únicas por ID de usuário
    active_modules.forEach(modulo => {

        // Considera apenas os módulos que são ativos no dia corrente e desconta do usuário
        if (modulo.stats.days === 2 || week_days[modulo.stats.days]?.includes(data1.getDay()) || modulo.stats.days - 4 === data1.getDay()) {
            if (users[modulo.uid]) {
                users[modulo.uid] += modulo.stats.price
                modules[modulo.uid]++
            } else {
                users[modulo.uid] = modulo.stats.price
                modules[modulo.uid] = 1
            }
        }
    })

    const ids = Object.keys(users)
    for (const id of ids) {

        const user = await getUser(client, id)
        user.misc.money -= users[id]
        let total = users[id]

        await client.prisma.userOptionsMisc.update({
            where: { id: user.misc_id },
            data: { money: user.misc.money }
        })

        // Desliga todos os módulos do usuário caso ele não tenha Bufunfas
        if (user.misc.money < users[id]) {
            await shutdownAllUserModules(id)

            // Avisando o usuário sobre o desligamento dos módulos
            client.sendDM(user.id, {content: client.tls.phrase(user, "misc.modulo.auto_desativado", client.emoji(30))}, true);
        }

        // Registrando as movimentações de bufunfas para o usuário
        await client.registryStatement(id, `misc.b_historico.modulos|${modules[id]}`, false, users[id])
        await client.journal("reback", total)
    }
}

module.exports.atualiza_modulos = atualiza_modulos
module.exports.requisita_modulo = requisita_modulo
module.exports.cobra_modulo = cobra_modulo