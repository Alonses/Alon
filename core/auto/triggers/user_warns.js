const { writeFileSync, readFile } = require('fs')

const { getTimedGuilds } = require('../../database/schemas/Guild.js')
const { checkUserGuildWarned, removeUserWarn } = require('../../database/schemas/User_warns.js')

const { spamTimeoutMap } = require('../../formatters/patterns/timeout.js')

async function atualiza_warns(client) {

    const dados = await getTimedGuilds(client)
    const warns = []

    for (const guild of dados) {
        const guild_warns = await checkUserGuildWarned(client, guild.id)

        // Listando todas as advertências do servidor
        guild_warns.forEach(warn => { warns.push(warn) })

        // Salvando as advertências no cache do bot
        writeFileSync("./files/data/user_timed_warns.txt", JSON.stringify(warns))
    }
}

async function verifica_warns(client) {

    readFile('./files/data/user_timed_warns.txt', 'utf8', async (err, data) => {
        // Interrompe a operação caso não haja advertências salvas em cache
        if (err || data === undefined || data.length < 1) return

        data = JSON.parse(data)

        const guilds_map = {}

        for (let i = 0; i < data.length; i++) {

            const warn = data[i]
            const guild = guilds_map[warn.server_id] ? guilds_map[warn.server_id] : await client.getGuild(warn.server_id, { warn: true })

            if (!guilds_map[warn.server_id]) // Salvando a guild em cache
                guilds_map[warn.server_id] = guild

            // Verificando se a advertência ultrapassou o tempo de exclusão
            if (client.timestamp() > (warn.timestamp + spamTimeoutMap[guild.warn.reset])) {

                // Excluindo o registro da advertência caso tenha zerado e verificando os cargos do usuário
                await removeUserWarn(client, warn.user_id, warn.server_id, warn.timestamp)
                client.verifyUserWarnRoles(warn.user_id, warn.server_id)
            }
        }

        // Atualizando as advertências em cache
        await atualiza_warns(client)
    })
}

module.exports.atualiza_warns = atualiza_warns
module.exports.verifica_warns = verifica_warns