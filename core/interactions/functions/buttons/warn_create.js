const { removeUserWarn, listAllCachedUserWarns, updateWarn} = require("../../../database/schemas/User_warns")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[2]
    const operacao = parseInt(dados.split(".")[1])

    // Rascunhos de advertências salvas em cache
    const user_warns = await listAllCachedUserWarns(client, id_alvo, interaction.guild.id)

    if (operacao === 0) { // Operação cancelada

        // Excluindo a advertência registrada em cache
        await removeUserWarn(client, id_alvo, interaction.guild.id, user_warns[user_warns.length - 1].timestamp)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "mode.warn.advertencia_cancelada", client.emoji(0)),
            embeds: [],
            components: [],
            ephemeral: true
        })
    }

    // Advertência confirmada
    const user_warn = user_warns[user_warns.length - 1]

    await updateWarn(client, user_warn.id, {
        timestamp: client.timestamp(),
        valid: true
    })

    const member_guild = await client.getMemberGuild(interaction, id_alvo)

    await require('../../../events/warn')({client, user, interaction, member_guild, user_warn})
}