const { EmbedBuilder } = require("discord.js")

const { getReport, updateUserReport} = require("../../database/schemas/User_reports")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const id_guild = dados.split(".")[1]
    const pagina = dados.split(".")[2]

    const alvo = await getReport(client, id_alvo, id_guild)

    // Atribuindo um nome ao moderador que criou o reporte no servidor
    if (!alvo.issuer_nick) {
        const cached_issuer = await client.getCachedUser(alvo.issuer)

        await updateUserReport(client, alvo, { issuer_nick: cached_issuer.username })
        alvo.issuer_nick = cached_issuer.username
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.report.remover_reporte"))
        .setColor(0xED4245)
        .setDescription(client.tls.phrase(user, "mode.report.remover_reporte_desc", null, alvo.relatory))
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.user_id}\`\n\`${alvo.nick ? (alvo.nick.length > 20 ? `${alvo.nick.slice(0, 20)}...` : alvo.nick) : client.tls.phrase(user, "mode.report.apelido_desconhecido")}\`\n( <@${alvo.user_id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportador")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.issuer}\`\n\`${alvo.issuer_nick ? (alvo.issuer_nick.length > 20 ? `${alvo.issuer_nick.slice(0, 20)}...` : alvo.issuer_nick) : client.tls.phrase(user, "mode.report.apelido_desconhecido")}\`\n( <@${alvo.issuer}> )`,
                inline: true
            },
            {
                name: ":globe_with_meridians: **Server**",
                value: `${client.emoji("icon_id")} \`${alvo.server_id}\`\n<t:${alvo.timestamp}:R>`,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de reporte
    const row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `remove_report|${pagina}` },
        { id: "report_remove_user", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}.${id_guild}` },
        { id: "report_remove_user", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${id_alvo}.${id_guild}` }
    ], interaction)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}