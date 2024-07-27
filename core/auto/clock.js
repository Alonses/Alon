const { mkdirSync, existsSync } = require('fs')

const sync_dynamic_badges = require("./triggers/user_dynamic_badges")

const { verifica_warns, atualiza_warns } = require("./triggers/user_warns")
const { verifica_roles, atualiza_roles } = require("./triggers/user_roles")
const { requisita_modulo, atualiza_modulos } = require("./triggers/user_modules")
const { verifica_user_eraser, atualiza_user_eraser } = require("./triggers/user_eraser")

const { verifica_servers } = require("../data/user_ranking")
const { verifica_eraser, atualiza_eraser } = require("./triggers/guild_eraser")
const { verifica_pre_warns, atualiza_pre_warns } = require('./triggers/guild_pre_warns')
const { atualiza_fixed_badges } = require('./triggers/user_fixed_badges')
const { atualiza_join_guilds } = require('./triggers/guild_join_roles')

module.exports = async ({ client }) => {

    if (!existsSync(`./files/data/`)) // Criando a pasta de dados para poder salvar em cache
        mkdirSync(`./files/data/`, { recursive: true })

    const date1 = new Date() // Trava o cronometro em um intervalo de 60 segundos
    const tempo_restante = 10 - date1.getSeconds()

    atualiza_warns(client)
    atualiza_pre_warns(client)

    atualiza_roles()
    atualiza_join_guilds(client)

    atualiza_modulos()
    atualiza_fixed_badges(client)

    atualiza_eraser(client)
    atualiza_user_eraser(client)

    console.log("📣 | Disparando o relógio interno")

    setTimeout(() => internal_clock(client, tempo_restante), 5000)
}

internal_clock = (client, tempo_restante) => {

    setTimeout(() => { // Sincronizando os dados do bot

        requisita_modulo(client) // Verificando se há modulos agendados para o horário atual
        verifica_warns(client) // Sincronizando as advertências temporárias
        verifica_pre_warns(client) // Sincronizando as anotações de advertências temporárias
        verifica_roles(client) // Sincronizando os cargos temporários

        if (client.timestamp() % 600 < 60) { // 10 Minutos
            sync_dynamic_badges(client) // Sincronizando as badges que são dinâmicas
            verifica_eraser(client) // Verificando se há dados de servidores que se expiraram
            verifica_user_eraser(client) // Verificando se há dados de usuários que se expiraram
        }

        if (client.timestamp() % 1800 < 60) // 30 Minutos
            verifica_servers() // Sincronizando o ranking global dos usuários que ganharam XP

        internal_clock(client, 60000)
    }, tempo_restante)
}