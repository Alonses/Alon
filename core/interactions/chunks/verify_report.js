const { EmbedBuilder } = require("discord.js")

const { getUserReports, getReport, updateUserReport} = require("../../database/schemas/User_reports")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const pagina = dados.split(".")[2]
    let avisos = 0, descricao = "", report_servidor = "", historico = []

    const alvo = {
        user_id: id_alvo,
        nick: null,
        executer: null,
        issuer_nick: null
    }

    const reports = await getUserReports(client, id_alvo)

    // Navegando por todos os reportes que o usuário recebeu e listando eles
    reports.forEach(valor => {
        avisos++

        if (valor.nick)
            alvo.nick = valor.nick

        historico.push(`-> ${new Date(valor.timestamp * 1000).toLocaleString("pt-BR")} | ${valor.relatory}`)

        if (valor.server_id === interaction.guild.id) {
            report_servidor = `\n:globe_with_meridians: **${client.tls.phrase(user, "mode.report.reporte_neste_servidor")}**\n\`\`\`-> ${new Date(valor.timestamp * 1000).toLocaleString("pt-BR")} | ${valor.relatory}\`\`\``
            alvo.executer = valor.issuer
        }
    })

    // Atribuindo um nome ao moderador que criou o reporte no servidor
    if (!alvo.issuer_nick && alvo.executer) {
        const cached_issuer = await client.getCachedUser(alvo.executer)
        const user_report = await getReport(client, id_alvo, interaction.guild.id)

        alvo.issuer_nick = cached_issuer.username
        await updateUserReport(client, user_report, { issuer_nick: cached_issuer.username })
    }

    if (avisos > 0)
        descricao = `\`\`\`${client.tls.phrase(user, "mode.report.com_report", 4)}\n\n${historico.join("\n---------\n").slice(0, 1000)}\`\`\``

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.report.historico_usuario"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${descricao}${report_servidor}`)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.user_id}\`\n\`${alvo.nick ? (alvo.nick.length > 20 ? `${alvo.nick.slice(0, 20)}...` : alvo.nick) : client.tls.phrase(user, "mode.report.apelido_desconhecido")}\`\n( <@${alvo.user_id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportador")}**`,
                value: `${alvo.executer ? `${client.emoji("icon_id")} \`${alvo.executer}\`` : ""}\n\`${alvo.issuer_nick ? (alvo.issuer_nick.length > 20 ? `${alvo.issuer_nick.slice(0, 20)}...` : alvo.issuer_nick) : client.tls.phrase(user, "mode.report.apelido_desconhecido")}\`${alvo.executer ? `\n( <@${alvo.executer}> )` : ""}`,
                inline: true
            },
            {
                name: `:man_guard: **${client.tls.phrase(user, "mode.report.reporte")}: ${avisos}**`,
                value: "⠀",
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de reporte
    let botoes = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `report_browse_user|${pagina}` }]

    if (alvo.executer || process.env.owner_id.includes(interaction.user.id)) // Botão para remover o reporte do usuário no servidor
        botoes = botoes.concat([{ id: "report_remove_user", name: client.tls.phrase(user, "menu.botoes.remover_reporte"), type: 1, emoji: client.emoji(39), data: `2|${id_alvo}.${interaction.guild.id}.${pagina}` }])

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}