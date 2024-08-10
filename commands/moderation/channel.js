const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("⌠💂⌡ Manage the channel for other users!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("lock")
                .setNameLocalizations({
                    "es-ES": 'bloquear',
                    "fr": 'bloc',
                    "it": 'bloccare',
                    "pt-BR": 'bloquear',
                    "ru": 'закрывать'
                })
                .setDescription("⌠💂⌡ Block current channel")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Aktuellen Kanal sperren',
                    "es-ES": '⌠💂⌡ Bloquear el canal actual',
                    "fr": '⌠💂⌡ Verrouiller la chaîne actuelle',
                    "it": '⌠💂⌡ Blocca il canale corrente',
                    "pt-BR": '⌠💂⌡ Bloqueie o canal atual',
                    "ru": '⌠💂⌡ заблокировать текущий канал'
                }))
        .addSubcommand(subcommand =>
            subcommand
                .setName("unlock")
                .setNameLocalizations({
                    "de": 'freischalten',
                    "es-ES": 'desbloquear',
                    "fr": 'ouvrir',
                    "it": 'aprire',
                    "pt-BR": 'desbloquear',
                    "ru": 'разблокировать'
                })
                .setDescription("⌠💂⌡ Unlock the current channel")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Aktuellen Kanal entsperren',
                    "es-ES": '⌠💂⌡ Desbloquear el canal actual',
                    "fr": '⌠💂⌡ Déverrouiller la chaîne actuelle',
                    "it": '⌠💂⌡ Sbloccare il canale corrente',
                    "pt-BR": '⌠💂⌡ Desbloqueie o canal atual',
                    "ru": '⌠💂⌡ разблокировать текущий канал'
                }))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    menu_data: new ContextMenuCommandBuilder()
        .setName("Purge user")
        .setNameLocalizations({
            "pt-BR": 'Purgar usuario'
        })
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute({ client, interaction }) {
        // Permissões para gerenciar canais e cargos necessária para a função de bloqueio do chat do servidor
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles])) {
            const user = await client.getUser(interaction.user.id)
            return client.tls.reply(interaction, user, "mode.ticket.permissao", true, 3)
        }
        const channel = await client.discord.channels.cache.get(interaction.channel.id)

        // Solicitando a função e executando
        require(`./subcommands/channel_${interaction.options.getSubcommand()}`)({ client, interaction, channel })
    },
    async menu({ client, interaction }) {
        const user = await client.getUser(interaction.user.id)
        // Verificando se o bot pode gerenciar as mensagens do servidor
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageMessages]))
            return client.tls.reply(interaction, user, "mode.clear.permissao", true, 3)

        // Excluindo as mensagens do usuário alvo
        interaction.targetMessage.channel.messages.fetch()
            .then(messages => {
                messages.forEach(async m => {
                    if (((m.createdAt - 1200) <= interaction.targetMessage.createdAt) && m.author.id === interaction.targetMessage.author.id)
                        await m.delete().catch(() => console.error)
                })

                client.tls.reply(interaction, user, "mode.clear.purge_user", true, 62, interaction.targetMessage.author.id)
            })
            .catch(() => client.tls.reply(interaction, user, "mode.clear.purge_error", true, client.emoji(0)))
    }
}