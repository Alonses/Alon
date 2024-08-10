const { PermissionsBitField, ChannelType } = require('discord.js')

module.exports = async ({ client, interaction, channel, solicitante, canal_servidor }) => {
    const user = await client.getUser(interaction.user.id)
    // Verificando se o canal ativo existe no servidor
    let verificacao = interaction.guild.channels.cache.find(c => c.id === channel.channel_id) || 404

    if (verificacao === 404)
        channel.channel_id = null

    if (channel.channel_id !== null) { // Re-exibindo o canal já existente ao usuário
        await canal_servidor.permissionOverwrites.edit(solicitante, {ViewChannel: true})

        return client.tls.reply(interaction, user, "mode.denuncia.canal_aberto", true, 48, channel.channel_id)
    }

    const everyone = interaction.guild.roles.cache.find(r => r.name === '@everyone')
    const bot = await client.getMemberGuild(interaction, client.id()) // Liberando ao canal para o bot
    const guild = await client.getGuild(interaction.guild.id, { tickets: true })

    // Criando o canal e atribuindo ele aos usuários especificos/ categoria escolhida
    interaction.guild.channels.create({
        name: interaction.user.username,
        type: ChannelType.GuildText,
        parent: guild.tickets.category,
        permissionOverwrites: [
            {
                id: everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: solicitante,
                allow: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: bot,
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    })
        .then(async new_channel => {
            client.tls.reply(interaction, user, "mode.denuncia.introducao", true, 7, new_channel.id)

            await client.prisma.userTickets.update({
                where: {
                    id: {
                        user_id: channel.user_id,
                        server_id: channel.server_id
                    }
                },
                data: { channel_id: new_channel.id }
            })
        })
        .catch(() => client.tls.reply(interaction, user, "mode.denuncia.erro_1", true, 4))
}