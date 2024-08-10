const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const row = client.create_buttons([
        { name: client.tls.phrase(user, "inic.ping.site"), type: 4, emoji: "🌐", value: 'http://alonsal.discloud.app/' },
        { name: client.tls.phrase(user, "inic.inicio.suporte"), type: 4, emoji: client.emoji("icon_rules_channel"), value: process.env.url_support },
        { id: "language", name: "Change language", type: 0, emoji: client.defaultEmoji("earth") }
    ], interaction)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "inic.ping.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setImage("https://i.imgur.com/N8AFVTH.png")
        .setDescription(`${client.tls.phrase(user, "inic.ping.boas_vindas_tutorial")}\n\n${client.defaultEmoji("earth")} | ${client.tls.phrase(user, "inic.ping.idioma_dica")}`)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}