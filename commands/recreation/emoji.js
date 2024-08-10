const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("⌠😂⌡ Increase emojis")
        .setDescriptionLocalizations({
            "de": '⌠😂⌡ Emojis vergrößern',
            "es-ES": '⌠😂⌡ Ampliar emojis',
            "fr": '⌠😂⌡ Augmenter les émoticônes',
            "it": '⌠😂⌡ Aumenta le emoticon',
            "pt-BR": '⌠😂⌡ Amplie os emojis',
            "ru": '⌠😂⌡ Увеличить смайлики'
        })
        .addStringOption(option =>
            option.setName("emoji")
                .setDescription(":the name of the emoji:")
                .setDescriptionLocalizations({
                    "de": ':der Name des Emojis:',
                    "es-ES": ':el nombre del emoji:',
                    "fr": ':le nom de l\'emoji:',
                    "it": ':il nome dell\'emoji:',
                    "pt-BR": ":o nome do emoji:",
                    "ru": ':название смайлика:'
                })
                .setRequired(true)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        const dados = interaction.options.getString("emoji")

        try {
            if (dados.startsWith("<") && dados.endsWith(">")) {
                const id = dados.match(/\d{15,}/g)[0]
                let url_emoji = `https://cdn.discordapp.com/emojis/${id}.gif`

                fetch(url_emoji)
                    .then(image => {
                        // Validando se o arquivo do emoji é um gif
                        if (image.status === 415) url_emoji = url_emoji.replace(".gif", ".png")

                        interaction.reply({
                            content: url_emoji,
                            ephemeral: client.decider(user?.conf.ghost_mode, 0)
                        })
                    })
            } else
                client.tls.reply(interaction, user, "mode.emojis.emoji_custom", true, 2)
        } catch { client.tls.reply(interaction, user, "mode.emojis.emoji_custom", true, 2) }
    }
}