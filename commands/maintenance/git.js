const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("git")
        .setDescription("⌠📡⌡ The Alonsal™️ repository")
        .setDescriptionLocalizations({
            "de": '⌠📡⌡ Das Alonsal™️-Repository',
            "es-ES": '⌠📡⌡ El repositorio de Alonsal™️',
            "fr": '⌠📡⌡ Le référentiel Alonsal™️',
            "it": '⌠📡⌡ Il repository Alonsal™️',
            "pt-BR": '⌠📡⌡ O repositório do Alonsal™️',
            "ru": '⌠📡⌡ Репозиторий Алонсал™'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { misc: true })
        const row = client.create_buttons([
            { name: "GitHub", type: 4, emoji: "🌐", value: "https://github.com/Alonses/Alonsal" },
            { name: "Alondioma", type: 4, emoji: "🏴‍☠️", value: "https://github.com/Alonses/Alondioma" }
        ])

        const embed = new EmbedBuilder()
            .setTitle(client.tls.phrase(user, "manu.git.repositorio"))
            .setColor(client.embed_color(user.misc.color))
            .setImage("https://i.imgur.com/0tV3IQr.png")
            .setDescription(client.tls.phrase(user, "manu.git.link"))
            .setAuthor({
                name: "GitHub",
                iconURL: "https://cdn-icons-png.flaticon.com/512/25/25231.png"
            })

        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    }
}