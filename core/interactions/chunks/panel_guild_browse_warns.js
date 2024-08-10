const { EmbedBuilder } = require('discord.js')

const { listAllUserWarns } = require('../../database/schemas/User_warns')

module.exports = async ({ client, interaction, dados }) => {
    const user = await client.getUser(interaction.user.id)
    let member = interaction.options?.getUser("user") || dados
    const user_warns = await listAllUserWarns(client, member.id, interaction.guild.id)

    if (user_warns.length < 1)
        return interaction.reply({
            content: client.tls.phrase(user, "mode.warn.sem_advertencia", 1),
            ephemeral: true
        })

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.warn.advertencia_titulo")} ${user_warns[0].nick} ${client.defaultEmoji("paper")}`)
        .setColor(client.embed_color(user.misc.color))
        .setFooter({
            text: client.tls.phrase(user, "mode.warn.gerenciar_advertencia"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    const botoes = []
    let counter = 0

    user_warns.forEach(warn => {
        botoes.push({ id: "warn_user_verify", name: `${counter + 1}°`, emoji: client.defaultEmoji("guard"), type: 1, data: `9|${warn.user_id}.${warn.timestamp}` })
        counter++
    })

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}