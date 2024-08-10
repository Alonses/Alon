const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cantada")
        .setDescription("⌠😂|🇧🇷⌡ Uma cantada aleatória do Vai dar namoro™️"),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })
        fetch(`${process.env.url_apisal}/random?cantadas`)
            .then(response => response.json())
            .then(async res => {

                const embed = new EmbedBuilder()
                    .setTitle(res.nome)
                    .setColor(client.embed_color(user.misc.color))
                    .setThumbnail(res.foto)
                    .setDescription(`> "${res.texto}"`)

                interaction.reply({
                    embeds: [embed],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            })
    }
}