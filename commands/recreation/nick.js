const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setNameLocalizations({
            "de": 'spitznamen',
            "es-ES": 'apodo',
            "fr": 'pseudo',
            "it": 'soprannome',
            "pt-BR": 'apelido',
            "ru": 'никнейм'
        })
        .setDescription("⌠😂⌡ Shuffles your nickname!")
        .setDescriptionLocalizations({
            "de": '⌠😂⌡ Mischen Sie Ihren Spitznamen',
            "es-ES": '⌠😂⌡ Mezcla tu apodo!',
            "fr": '⌠😂⌡ Mélangez votre pseudo!',
            "it": '⌠😂⌡ Mescola il tuo soprannome!',
            "pt-BR": '⌠😂⌡ Embaralha seu apelido!',
            "ru": '⌠😂⌡ Перемешайте свой никнейм!'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        if (interaction.guild.ownerId === interaction.user.id)
            return client.tls.reply(interaction, user, "dive.nick.permissao_1", true, client.emoji(0))

        // Libera a função apenas se puder editar o apelido de outros usuários
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ChangeNickname]))
            return client.tls.reply(interaction, user, "dive.nick.permissao_2", true, client.emoji(0))

        const user_alvo = await client.getMemberGuild(interaction, interaction.user.id)

        let apelido = user_alvo.nickname || user_alvo.user.username

        user_alvo.setNickname(client.shuffleArray(apelido.split("").join("").trim()))
            .then(() => client.tls.reply(interaction, user, "dive.nick.apelido", client.decider(user?.conf.ghost_mode, 0), null, apelido))
            .catch(() => client.tls.reply(interaction, user, "dive.nick.error_1", true, client.emoji(0)))
    }
}