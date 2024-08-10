const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nazar")
        .setDescription("⌠🎲⌡ Madame Nazar's location today")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ Zeigt, wo Madam Nazar heute ist',
            "es-ES": '⌠🎲⌡ Ubicación de Madame Nazar hoy',
            "fr": '⌠🎲⌡ Emplacement de Madame Nazar aujourd\'hui',
            "it": '⌠🎲⌡ La location di Madame Nazar oggi',
            "pt-BR": '⌠🎲⌡ Mostra onde a Madame Nazar se encontra hoje',
            "ru": '⌠🎲⌡ Показывает, где сегодня находится мадам Назар'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })
        fetch("https://madam-nazar-location-api.herokuapp.com/location/current")
            .then(res => res.json())
            .then(dados => {

                dados = dados.data

                const embed = new EmbedBuilder()
                    .setTitle(`> ${client.tls.phrase(user, "game.nazar.titulo")}`)
                    .setColor(client.embed_color(user.misc.color))
                    .setImage(dados.location.image)
                    .setDescription(client.tls.phrase(user, "game.nazar.descricao", null, [dados.location.region.name, dados.location.region.precise, dados.location.near_by[0], dados.location.near_by[1]]))

                interaction.reply({
                    embeds: [embed],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            })
            .catch(() => client.tls.reply(interaction, user, "game.nazar.error_1", true, 1))
    }
}