const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("curiosidade")
        .setDescription("⌠😂|🇧🇷⌡ Uma curiosidade aleatória"),
    async execute(client, user, interaction) {

        fetch(`${process.env.url_apisal}/curiosidades`)
            .then(response => response.json())
            .then(async res => {

                const embed = new EmbedBuilder()
                    .setColor(client.embed_color(user.misc.color))
                    .setAuthor({ name: res.nome, iconURL: res.foto })
                    .setDescription(res.texto)

                if (res.img_curio) // Imagem da curiosidade
                    embed.setImage(res.img_curio)

                interaction.reply({ embeds: [embed], ephemeral: client.ephemeral(user?.conf.ghost_mode, 0) })
            })
    }
}