const { EmbedBuilder } = require("discord.js")

const { getCachedSuspiciousLink } = require("../../database/schemas/Spam_links")

module.exports = async ({ client, user, interaction, dados }) => {

    const timestamp = dados.split(".")[1]
    const pagina = parseInt(dados.split(".")[2])
    const link = await getCachedSuspiciousLink(client, timestamp)

    if (!link) // Link não encontrado
        return client.reply(interaction, {
            content: client.tls.phrase(user, "mode.link_suspeito.link_nao_encontrado", 1)
        })

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.link_suspeito.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.link_suspeito.descricao_link", null, link.link))
        .setFields(
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "mode.link_suspeito.identificado")} <t:${timestamp}:R>**`,
                value: `( <t:${timestamp}:f> )`,
                inline: false
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "mode.link_suspeito.rodape_dica"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    const row = client.create_buttons([
        { id: "spam_link_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `2.${pagina}` },
        { id: "spam_link_button", name: client.tls.phrase(user, "menu.botoes.remover_link"), type: 3, emoji: client.emoji(13), data: `5|${timestamp}` }
    ], interaction)

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}