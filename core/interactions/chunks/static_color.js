const { EmbedBuilder } = require('discord.js')

const { colorsMap, colorsPriceMap } = require('../../formatters/patterns/user')

module.exports = async ({ client, interaction, valor }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    let entrada = interaction.options?.getString("color") || valor

    if (user.misc.color === colorsMap[entrada][1])
        return client.tls.reply(interaction, user, "misc.color.cor_ativa", true, 7)

    let cor_demonstracao = entrada === "random" ? client.embed_color("RANDOM") : colorsMap[entrada][0]
    let nota_cor_aleatoria = ""

    if (entrada === "random")
        nota_cor_aleatoria = `\n:rainbow: ${client.tls.phrase(user, "misc.color.rand_color")}`

    // Enviando o embed para validação
    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "misc.color.titulo"))
        .setColor(cor_demonstracao)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`\`\`\`${client.tls.phrase(user, "misc.color.descricao")}\`\`\`${nota_cor_aleatoria}`)
        .setFields({
            name: `:money_with_wings: **${client.tls.phrase(user, "misc.color.preco")}**`,
            value: `\`B$ ${colorsPriceMap[colorsMap[entrada][1]]}\``,
            inline: false
        })
        .setFooter({
            text: client.tls.phrase(user, "misc.color.footer"),
            iconURL: client.avatar()
        })

    // Criando os botões para a cor customizada
    const row = client.create_buttons([
        { id: "user_custom_color", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${entrada}` },
        { id: "user_custom_color", name: client.tls.phrase(user, "menu.botoes.escolher_cor"), type: 1, emoji: client.defaultEmoji("pen"), data: `2|${entrada}` },
        { id: "user_custom_color", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: 0 }
    ], interaction)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}