const { EmbedBuilder, PermissionsBitField } = require('discord.js')

const { listRankGuild } = require('../../database/schemas/User_rank_guild')
const { checkUserGuildReported } = require('../../database/schemas/User_reports')
const { listAllGuildWarns } = require('../../database/schemas/Guild_warns')
const { defaultEraser } = require('../../formatters/patterns/timeout')

module.exports = async ({ client, interaction, operador, pagina_guia }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const rank = await listRankGuild(client, interaction.guild.id)
    const warns = await listAllGuildWarns(client, interaction.guild.id)
    const reportes = await checkUserGuildReported(client, interaction.guild.id)

    const guild = await client.getGuild(interaction.guild.id, {
        logger: true,
        network: true,
        reports: true,
        spam: true,
        warn: true
    }), pagina = pagina_guia || 0
    const network = guild.network.link ?? 0

    await client.deferedResponse({ interaction })

    let dados = ""
    let botoes = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild.0" }]

    if (pagina === 1)
        botoes = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_data.0" }]

    if (guild.inviter)
        dados += `\n${client.emoji("aln_hoster")} **${client.tls.phrase(user, "manu.data.hoster_alonsal")}**\n${client.emoji("icon_id")} \`${guild.inviter}\`\n<@${guild.inviter}>\n`

    if (reportes.length > 0)
        dados += `\n${client.emoji(6)} **${client.tls.phrase(user, "manu.guild_data.reportes_criados")}**\n\`${reportes.length > 1 ? `${reportes.length} ${client.tls.phrase(user, "manu.guild_data.reportes")}` : `1 ${client.tls.phrase(user, "manu.guild_data.reporte")}`}\`\n`

    if (warns.length > 0)
        dados += `\n${client.emoji(0)} **${client.tls.phrase(user, "manu.guild_data.advertencias_ativas")}**\n\`${warns.length > 1 ? `${warns.length} ${client.tls.phrase(user, "manu.guild_data.advertencias")}` : `1 ${client.tls.phrase(user, "manu.guild_data.advertencia")}`}\`\n`

    if (rank.length > 0)
        dados += `\n${client.emoji(56)} **${client.tls.phrase(user, "manu.guild_data.ranking_servidor")}**\n\`${rank.length > 1 ? `${rank.length} ${client.tls.phrase(user, "manu.guild_data.membros")}` : `1 ${client.tls.phrase(user, "manu.guild_data.membro")}`}\`\n`

    if (network > 1) {
        dados += `\n${client.emoji(36)} **Network**\n\`${network > 1 ? client.tls.phrase(user, "manu.guild_data.network_servidores", null, network) : client.tls.phrase(user, "manu.guild_data.network_unico")}\``
        dados += `\n:link: **${client.tls.phrase(user, "manu.guild_data.outros_servidores")}:**\n${guild.network_link ? await client.getNetWorkGuildNames(user, guild.network.link, interaction) : client.tls.phrase(user, "manu.guild_data.sem_servidores")}\n`
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "manu.guild_data.dados_servidor_titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.logger.enabled)} **${client.tls.phrase(user, "manu.painel.log_eventos")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild?.network.enabled)} **Network**\n${client.execute("functions", "emoji_button.emoji_button", guild?.tickets.enabled)} **${client.tls.phrase(user, "manu.painel.denuncias_server")}**`,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.warn.enabled)} **${client.tls.phrase(user, "mode.warn.advertencias")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild?.reports.enabled)} **${client.tls.phrase(user, "manu.painel.reports_externos")}**`,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.spam.enabled)} **${client.tls.phrase(user, "manu.painel.anti_spam")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild?.games_enabled)} **${client.tls.phrase(user, "manu.painel.anuncio_games")}**\n${client.execute("functions", "emoji_button.emoji_button", guild?.nuke_invites)} **${client.tls.phrase(user, "manu.painel.convites_rastreados")}**`,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "manu.guild_data.opcoes_rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 0)
        embed.setDescription(client.tls.phrase(user, "manu.guild_data.resumo_dados", null, dados))
    else {

        let tempo_exclusao = ""

        if (guild.erase.timeout)
            tempo_exclusao = `\n**${client.defaultEmoji("time")} ${client.tls.phrase(user, "manu.guild_data.tempo_exclusao")}**:\n${client.tls.phrase(user, "manu.guild_data.excluir_apos", null, defaultEraser[guild.erase.timeout] / 86400)}`

        embed.setDescription(client.tls.phrase(user, "manu.guild_data.resumo_expandido", null, tempo_exclusao))
    }

    botoes.push({ id: "data_guild_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "0" })

    // Verificando se o membro possui permissões para gerenciar o tempo de exclusão do servidor
    if (await client.permissions(interaction, interaction.user.id, [PermissionsBitField.Flags.ManageGuild]))
        botoes.push({ id: "data_guild_button", name: client.tls.phrase(user, "menu.botoes.definir_exclusao"), type: 3, emoji: client.defaultEmoji("time"), data: "2" })

    if (pagina === 0)
        botoes.push({ id: "data_guild_button", name: client.tls.phrase(user, "menu.botoes.mais_detalhes"), type: 1, emoji: client.defaultEmoji("paper"), data: "1" })

    interaction.editReply({
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}