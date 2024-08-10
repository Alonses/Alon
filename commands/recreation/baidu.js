const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("baidu")
        .setDescription("⌠😂⌡ Praise be!")
        .setDescriptionLocalizations({
            "de": '⌠😂⌡Ehre sei Gott!',
            "es-ES": '⌠😂⌡ ¡Alabado seas!',
            "fr": '⌠😂⌡ Loué soit!',
            "it": '⌠😂⌡ Sia lodato!',
            "pt-BR": '⌠😂⌡ Louvado seja!',
            "ru": '⌠😂⌡ Слава!'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        const baidu = new AttachmentBuilder("./files/img/baidu.png")
        interaction.reply({
            content: client.tls.phrase(user, "dive.baidu"),
            files: [baidu],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}