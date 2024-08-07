const { EmbedBuilder } = require("discord.js")

const { getReportedUsers } = require("../../database/schemas/User_reports")

module.exports = async ({ client, interaction }) => {

    const reports = await getReportedUsers(client)

    const embed = new EmbedBuilder()
        .setTitle(`> Reportes gerados ${client.defaultEmoji("guard")}`)
        .setColor(0x29BB8E)
        .setFields({
            name: `${client.defaultEmoji("person")} **Reportados: ${reports.length}**`,
            value: "⠀",
            inline: true
        })
        .setFooter({
            text: "Selecione uma das opções abaixo para navegar",
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    const row = client.create_buttons([
        { id: "return_button", name: "Retornar", type: 0, emoji: client.emoji(19), data: "panel_geral" }
    ], interaction)

    interaction.update({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}