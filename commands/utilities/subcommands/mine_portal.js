const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    let x = interaction.options.getInteger("x")
    let z = interaction.options.getInteger("z")

    // Do nether para a superfície ( *8 )
    let operacao = 0, caso = `🍀 ${client.tls.phrase(user, "game.portal.superficie")} -> 🔥 Nether`, dimension = client.tls.phrase(user, "game.portal.na_superficie"), to_dimension = client.tls.phrase(user, "game.portal.o_nether")

    if (interaction.options.getString("destiny"))
        operacao = parseInt(interaction.options.getString("destiny"))

    if (operacao === 0) { // Para a superfície
        x /= 8, z /= 8

        caso = `🔥 Nether -> 🍀 ${client.tls.phrase(user, "game.portal.superficie")}`, dimension = client.tls.phrase(user, "game.portal.no_nether"), to_dimension = client.tls.phrase(user, "game.portal.a_superficie")
    } else
        x *= 8, z *= 8

    let x_i = parseInt(x), z_i = parseInt(z)

    x = interaction.options.getInteger("x")
    z = interaction.options.getInteger("z")

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "game.portal.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "game.portal.descricao", null, [client.emoji("mc_portal"), dimension, x_i, z_i, client.emoji("mc_portal_frame"), to_dimension, x, z]))
        .setFooter({
            text: caso,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    interaction.reply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}