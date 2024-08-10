const { EmbedBuilder } = require('discord.js')

const { rgbToHex } = require('../../../core/functions/hex_color')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    // Cor customizada
    const rgb = {
        r: interaction.options.getInteger("r"),
        g: interaction.options.getInteger("g"),
        b: interaction.options.getInteger("b")
    }

    // Convertendo do RGB para HEX
    const new_color = rgbToHex(rgb.r, rgb.g, rgb.b)

    if (user.misc.color === new_color)
        return client.tls.reply(interaction, user, "misc.color.cor_ativa", true, 7)

    // Enviando o embed para validação
    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "misc.color.titulo"))
        .setColor(new_color)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`\`\`\`${client.tls.phrase(user, "misc.color.descricao")}\`\`\``)
        .setFooter({
            text: client.tls.phrase(user, "misc.color.footer"),
            iconURL: client.avatar()
        })

    // Criando os botões para a cor customizada
    const row = client.create_buttons([
        { id: "user_custom_color", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|custom-${new_color}` },
        { id: "user_custom_color", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: 0 }
    ], interaction)

    interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}