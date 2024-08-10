const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {

    const embed = new EmbedBuilder()
        .setTitle("> Painel de controle do Alonsal")
        .setColor(0x29BB8E)
        .setFooter({
            text: "Selecione uma das opções abaixo para navegar",
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    const row = client.create_buttons([
        { id: "internal_conf_panel", name: "Informações", type: 1, emoji: client.defaultEmoji("paper"), data: "0" },
        { id: "internal_conf_panel", name: "Funções", type: 1, emoji: client.emoji("icon_slash_commands"), data: "1" },
        { id: "internal_conf_panel", name: "Status", type: 1, emoji: client.defaultEmoji("channel"), data: "2" }
    ], interaction)

    client.reply(interaction, {
        content: '',
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}