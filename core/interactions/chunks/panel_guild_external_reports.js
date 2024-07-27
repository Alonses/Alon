const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { banMessageEraser } = require('../../formatters/patterns/timeout')
const {updateGuild} = require("../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, pagina_guia }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const pagina = pagina_guia || 0
    let botoes = []

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())

    // Desabilitando o AutoBan caso o bot não possa banir os membros do servidor
    if (!membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))
        await updateGuild(client, guild.id, { reports_auto_ban: false })

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.report.reportes_externos")} ${client.defaultEmoji("guard")}`)
        .setColor(client.embed_color(user.misc.color))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf_reports)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild?.reports_auto_ban)} **AutoBan**\n${client.execute("functions", "emoji_button.emoji_button", guild?.reports_notify)} **${client.tls.phrase(user, "mode.report.aviso_de_entradas")}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("role")} **${client.tls.phrase(user, "mode.anuncio.cargo")}**`,
                value: `${guild.reports_role ? `${client.emoji("icon_id")} \`${guild.reports_role}\`\n( <@&${guild.reports_role}> )` : `\`Sem cargo\``}`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${client.emoji("icon_id")} \`${guild.reports_channel}\`\n( <#${guild.reports_channel}> )`,
                inline: true
            },
            {
                name: `:wastebasket: **${client.tls.phrase(user, "manu.painel.excluir_banidos")}**`,
                value: `\`${client.tls.phrase(user, `menu.network.${banMessageEraser[guild.reports_erase_ban_messages]}`)}\``,
                inline: false
            },
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))} **${client.tls.phrase(user, "mode.network.banir_membros")}**`,
                inline: true
            },
            {
                name: "⠀",
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 0) {

        embed.setDescription(client.tls.phrase(user, "mode.report.funcionamento_reportes"))
        botoes = botoes.concat([
            { id: "guild_reports_button", name: client.tls.phrase(user, "manu.painel.reports_externos"), type: client.execute("functions", "emoji_button.type_button", guild?.conf_reports), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.conf_reports), data: "1" },
            { id: "guild_reports_button", name: "AutoBan", type: 1, emoji: client.emoji(41), data: "20" },
            { id: "guild_reports_button", name: client.tls.phrase(user, "menu.botoes.ajustes"), type: 1, emoji: client.emoji(41), data: "21" }
        ])
    } else if (pagina === 1) {

        embed.setDescription(client.tls.phrase(user, "mode.report.funcionamento_autoban"))
        botoes = botoes.concat([
            { id: "guild_reports_button", name: "AutoBan", type: client.execute("functions", "emoji_button.type_button", guild?.reports_auto_ban), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.reports_auto_ban), data: "2", disabled: !membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers) },
            { id: "guild_reports_button", name: client.tls.phrase(user, "menu.botoes.exclusao"), type: 1, emoji: client.emoji(13), data: "6" }
        ])
    } else if (pagina === 2) {

        embed.setDescription(client.tls.phrase(user, "mode.report.funcionamento_aviso_entradas"))
        botoes = botoes.concat([
            { id: "guild_reports_button", name: client.tls.phrase(user, "mode.report.aviso_de_entradas"), type: client.execute("functions", "emoji_button.type_button", guild?.reports_notify), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.reports_notify), data: "3" },
            { id: "guild_reports_button", name: client.tls.phrase(user, "mode.anuncio.cargo"), type: 1, emoji: client.defaultEmoji("role"), data: "5", disabled: !membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles) },
            { id: "guild_reports_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "4" },
        ])
    }

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: pagina < 1 ? "panel_guild.1" : "panel_guild_external_reports" }], interaction)],
        ephemeral: true
    })
}