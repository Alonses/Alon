const { writeFileSync, readFile } = require('fs')

const { defaultEraser } = require('../../formatters/patterns/timeout.js')

const { getTimedPreGuilds } = require('../../database/schemas/Guild.js')
const { checkUserGuildPreWarned, removeUserPreWarn } = require('../../database/schemas/User_pre_warns.js')

async function atualiza_pre_warns(client) {

    const dados = await getTimedPreGuilds(client)
    const warns = []

    for (const guild of dados) {
        const guild_warns = await checkUserGuildPreWarned(client, guild.id)

        // Listando todas as anotações de advertências do servidor
        guild_warns.forEach(warn => { warns.push(warn) })

        // Salvando as anotações de advertências no cache do bot
        writeFileSync("./files/data/user_timed_pre_warns.txt", JSON.stringify(warns))
    }
}

async function verifica_pre_warns(client) {

    readFile('./files/data/user_timed_pre_warns.txt', 'utf8', async (err, data) => {
        // Interrompe a operação caso não haja anotações de advertências salvas em cache
        if (err || data === undefined || data.length < 1) return

        data = JSON.parse(data)

        const guilds_map = {}

        for (let i = 0; i < data.length; i++) {

            const warn = data[i]
            const guild = guilds_map[warn.server_id] ? guilds_map[warn.server_id] : await client.getGuild(warn.server_id, { warn: true })

            if (!guilds_map[warn.server_id]) // Salvando a guild em cache
                guilds_map[warn.server_id] = guild

            // Verificando se a anotação de advertência ultrapassou o tempo de exclusão
            if (client.timestamp() > (warn.timestamp + defaultEraser[guild.warn.hierarchy_reset])) {

                // Excluindo o registro da anotação de advertência caso tenha zerado e verificando os cargos do usuário
                await removeUserPreWarn(warn.user_id, warn.server_id, warn.timestamp)
            }
        }

        // Atualizando as anotações de advertência em cache
        await atualiza_pre_warns(client)
    })
}

module.exports.atualiza_pre_warns = atualiza_pre_warns
module.exports.verifica_pre_warns = verifica_pre_warns