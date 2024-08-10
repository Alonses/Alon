const { atualiza_user_eraser } = require('../auto/triggers/user_eraser')
const { getUserGlobalRank } = require('../database/schemas/User_rank_global')
const { getUserRankServer, getUserRankServers, updateUserRankGuild} = require('../database/schemas/User_rank_guild')

const { CHECKS } = require('../formatters/patterns/user')
const { defaultUserEraser } = require('../formatters/patterns/timeout')
const {client_data} = require("../../setup");

let members_xp = []

module.exports = async ({ client, message, caso }) => {

    //            Comandos            Mensagens
    let id_alvo = message.user?.id || message.author?.id

    // Coletando os dados do usuário alvo
    const user = await getUserRankServer(client, id_alvo, message.guild.id);

    // Sincronizando o XP interno de todos os servidores que o usuário faz parte
    if (!user.ixp) {
        user.ixp = user.xp
        await sincroniza_xp(client, user)
    }

    const user_data = await client.getUser(user.user_id, {
        erase: true,
        misc: true
    }) // Salvando a última interação do usuário

    if (user_data.erase.forced) return // Usuário forçou a exclusão de dados

    let cached_erase = false

    if (user_data.erase.valid) { // Usuário interagiu com o Alonsal novamente
        client.sendDM(user_data.id, { content: client.tls.phrase(user_data, "manu.data.aviso_remocao_exclusao", client.defaultEmoji("person")) })

        user_data.erase.valid = false // Retirando a etiqueta para remoção de dados
        cached_erase = true
    }

    if (user.erase_valid) { // Usuário interagiu com o Alonsal novamente
        client.sendDM(user_data.id, { content: client.tls.phrase(user_data, "manu.data.aviso_remocao_exclusao_servidor", client.defaultEmoji("person"), await (client.guilds(message.guild.id)).name) })

        user.erase_valid = false // Retirando a etiqueta para remoção de dados
        cached_erase = true
    }

    user_data.erase_on = client.timestamp() + defaultUserEraser[user_data.erase.timeout]

    if (cached_erase) // Atualizando a lista de usuários que estão marcados para exclusão
        await atualiza_user_eraser(client)

    // Validando se o usuário tem o ranking habilitado
    if (!await client.verifyUserRanking(user.user_id)) return

    //              Comandos                  Mensagens
    user.nickname = message.user?.username || message.author?.username

    if (caso === "messages") {
        if (user.warns >= CHECKS.LIMIT) {
            user.caldeira_de_ceira = true
            user.warns = 0

            validador = true
            await updateUserRankGuild(client, user, user)
            await client.prisma.userOptionsErase.update({
                where: { id: user_data.id },
                data: user_data.erase
            })

            return
        }

        if (message.createdTimestamp - user.lastInteraction < CHECKS.DIFF) {
            user.warns++

            await updateUserRankGuild(client, user, user)
            await client.prisma.userOptionsErase.update({
                where: { id: user_data.erase_id },
                data: user_data.erase
            })

            return
        }
    }

    // Limitando o ganho de XP por spam no chat
    if (user.caldeira_de_ceira)
        if (message.createdTimestamp - user.lastInteraction > CHECKS.HOLD)
            user.caldeira_de_ceira = false
        else if (caso === "messages") return

    // Coletando o XP atual e somando ao total do usuário
    let xp_anterior = user.ixp

    // Recalculando o tempo de inatividade do usuário
    user.erase_on = client.timestamp() + defaultUserEraser[user_data.erase.guild_timeout]

    if (caso === "messages") {

        user.xp += client.cached.ranking_value
        user.ixp += client.cached.ranking_value

        user.lastInteraction = new Date(message.createdTimestamp)
        user.warns = 0
    } else if (caso === "comando") { // Experiência obtida executando comandos
        user.xp += client.cached.ranking_value * 1.5
        user.ixp += client.cached.ranking_value * 1.5
    } else { // Experiência obtida ao usar botões ou menus
        user.xp += client.cached.ranking_value * 0.5
        user.ixp += client.cached.ranking_value * 0.5
    }

    // Bônus em Bufunfas por subir de nível
    if (user.ixp !== xp_anterior) {
        await client.prisma.userOptionsMisc.update({
            where: { id: user_data.misc_id },
            data: { money: { increment: 250 } }
        })

        // Registrando as movimentações de bufunfas para o usuário
        client.registryStatement(user_data.id, "misc.b_historico.nivel", true, 250)
        client.journal("gerado", 250)
    }

    // Registrando no relatório algumas informações
    client.journal(caso)
    await updateUserRankGuild(client, user, user)

    // Adicionando o usuário na fila de ranking global para a próxima sincronização
    if (!members_xp.includes(user.user_id)) members_xp.push(user.user_id)
}

sincroniza_xp = async (client, user) => {
    const servidores = await getUserRankServers(client, user.user_id)

    for (const servidor of servidores)
        await updateUserRankGuild(client, servidor, { ixp: servidor.xp })
}

async function verifica_servers(client) {

    let array_copia = members_xp
    members_xp = []

    if (array_copia.length > 0) // Sincronizando todos os rankings globais dos usuários que ganharam XP nos últimos 10min
        for (let i = 0; i < array_copia.length; i++) {

            id_user = array_copia[i]

            /* Verifica todos os servidores em busca do servidor com maior XP
            e salvando o maior servidor válido no ranking global */
            const servers = await getUserRankServers(client, id_user)
            let user_global = await getUserGlobalRank(client, id_user), maior = 0

            for (const servidor of servers) {
                if (servidor.ixp > maior) {
                    maior = servidor.ixp

                    await updateUserRankGuild(client_data, user_global, {
                        xp: servidor.ixp,
                        server_id: servidor.server_id
                    })
                }
            }
            array_copia.shift()
        }
}

module.exports.verifica_servers = verifica_servers