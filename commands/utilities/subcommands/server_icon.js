const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    const icone_server = interaction.guild.iconURL({ size: 2048 })

    if (!icone_server)
        return client.tls.reply(interaction, user, "util.avatar.sem_icone", client.decider(user?.conf.ghost_mode, 0), 1)

    const row = client.create_buttons([
        { name: client.tls.phrase(user, "menu.botoes.navegador"), type: 4, emoji: "🌐", value: icone_server }
    ])

    const embed = new EmbedBuilder()
        .setTitle(interaction.guild.name)
        .setColor(client.embed_color(user.misc.color))
        .setImage(icone_server)
        .setDescription(client.tls.phrase(user, "util.avatar.download_icon"))

    interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}