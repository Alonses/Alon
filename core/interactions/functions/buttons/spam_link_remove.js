const { getCachedSuspiciousLink, getAllGuildSuspiciousLinks } = require("../../../database/schemas/Spam_links")

module.exports = async ({ client, user, interaction, dados, pagina_guia }) => {

    // Gerenciamento de anotações
    const operacao = parseInt(dados.split(".")[1])

    let row = []

    // Códigos de operação
    // 0 -> Cancela o apagamento do link
    // 1 -> Exclui o link suspeito informado

    if (!operacao) {

        const links = await getAllGuildSuspiciousLinks(client, interaction.guild.id)

        if (links.length > 0) // Verificando se há links suspeitos no servidor
            row = client.create_buttons([
                { id: "spam_link_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "2" }
            ], interaction)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "mode.link_suspeito.operacao_cancelada_exclusao", 0),
            embeds: [],
            components: [row],
            ephemeral: true
        })
    }

    if (operacao === 1) {

        const timestamp = dados.split(".")[2]
        const guild_id = dados.split(".")[3]

        const link = await getCachedSuspiciousLink(client, timestamp)
        const guild = await client.getGuild(interaction.guild.id)

        // Notificando sobre a adição de um novo link suspeito ao banco do Alonsal e ao servidor original
        client.notify(process.env.channel_feeds, { content: `:link: :no_entry_sign: | Um link suspeito foi removido manualmente!\n( \`${link.link.split("").join(" ")}\` )` })
        client.notify(guild.spam_channel || guild.logger_channel, { content: client.tls.phrase(guild, "mode.link_suspeito.excluido_manual", [44, 13], link.link.split("").join(" ")) })

        // Excluindo o link suspeito
        await client.prisma.spamLinks.delete({ where: { id: link.id } })

        const links = await getAllGuildSuspiciousLinks(client, interaction.guild.id)

        if (links.length > 0) // Verificando se há links suspeitos no servidor
            row = client.create_buttons([
                { id: "spam_link_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "2" }
            ], interaction)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "mode.link_suspeito.aviso_remocao", 44, guild.spam_channel || guild.logger_channel),
            embeds: [],
            components: [row],
            ephemeral: true
        })
    }
}