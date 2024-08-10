const { dropTicket } = require('../../../core/database/schemas/User_tickets')

module.exports = async ({ client, interaction, channel, solicitante, canal_servidor }) => {
    const user = await client.getUser(interaction.user.id)
    // Sem canal de denúncias ativo
    if (channel.channel_id === null)
        return client.tls.reply(interaction, user, "mode.denuncia.canal_fechado", true, 4)

    const date1 = new Date()

    client.tls.reply(interaction, user, "mode.denuncia.fechando_canal", true, 7, `<t:${Math.floor((date1.getTime() + 10000) / 1000)}:R>`)

    setTimeout(async () => {
        await canal_servidor.permissionOverwrites.edit(solicitante, {ViewChannel: false})

        // Apagando o ticket de denúncia do usuário
        await dropTicket(client, interaction.guild.id, interaction.user.id)
        // canal_servidor.delete()
    }, 10000)
}