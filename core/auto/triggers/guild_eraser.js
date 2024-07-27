const { writeFileSync, readFile } = require('fs')

const { getEraseGuilds, dropGuild } = require('../../database/schemas/Guild.js')
const { dropAllRankGuild } = require('../../database/schemas/User_rank_guild.js')
const { updateGuildReport } = require('../../database/schemas/User_reports.js')
const { updateGuildSuspectLink } = require('../../database/schemas/Spam_links.js')
const { dropAllGuildWarns } = require('../../database/schemas/Guild_warns.js')
const { dropAllGuildTickets } = require('../../database/schemas/User_tickets.js')
const { dropRoleAssigner } = require('../../database/schemas/Guild_role_assigner.js')
const { dropAllGuildStrikes } = require('../../database/schemas/Guild_strikes.js')
const { dropAllUserGuilds } = require('../../database/schemas/User_guilds.js')

async function atualiza_eraser(client) {

    const dados = await getEraseGuilds(client)

    // Salvando os servidores marcados para exclusão no cache do bot
    writeFileSync("./files/data/erase_guild.txt", JSON.stringify(dados))
}

async function verifica_eraser(client) {

    readFile('./files/data/erase_guild.txt', 'utf8', async (err, data) => {
        // Interrompe a operação caso não haja advertências salvas em cache
        if (err || data === undefined || data.length < 1) return
        data = JSON.parse(data)


        for (let i = 0; i < data.length; i++) {

            const servidor = data[i]

            if (client.timestamp() > servidor.erase.timestamp) {

                // Excluindo todos os rankings registrados no servidor
                await dropAllRankGuild(servidor.sid)

                // Excluindo todas as advertências criadas no servidor
                await dropAllGuildWarns(servidor.sid)

                // Excluindo todos os tickets criados no servidor
                await dropAllGuildTickets(servidor.sid)

                // Excluindo a configuração de cargos automáticos do servidor
                await dropRoleAssigner(servidor.sid)

                // Excluindo todos os strikes criados no servidor
                await dropAllGuildStrikes(servidor.sid)

                // Excluindo todas as advertências criadas no servidor
                await dropAllGuildWarns(servidor.sid)

                // Excluindo todos os servidores salvos em cache que referênciam o servidor excluído
                await dropAllUserGuilds(servidor.sid)

                // Atualizando o reportes gerados no servidor
                await updateGuildReport(servidor.sid)

                // Atualizando os links suspeitos no servidor
                await updateGuildSuspectLink(servidor.sid)

                // Exclui o servidor por completo
                await dropGuild(client, servidor.sid)
            }
        }

        // Atualizando as solicitações de exclusão em cache
        atualiza_eraser(client)
    })
}

module.exports.atualiza_eraser = atualiza_eraser
module.exports.verifica_eraser = verifica_eraser