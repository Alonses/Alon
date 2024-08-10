const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { listAllGuildWarns } = require("../../database/schemas/Guild_warns")

const { defaultEraser } = require('../../formatters/patterns/timeout')
const { default_emoji } = require('../../../files/json/text/emojis.json')

module.exports = async ({ client, interaction, pagina_guia }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const guild = await client.getGuild(interaction.guild.id, { warn: true })
    let botoes = [], texto_rodape = client.tls.phrase(user, "manu.painel.rodape")

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())
    const advertencias = await listAllGuildWarns(client, interaction.guild.id)

    const embed = new EmbedBuilder()
        .setTitle(`> ${client.tls.phrase(user, "mode.hierarquia.status_ativacao")} :crown: :octagonal_sign:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.hierarquia.descricao_painel_config"))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild.warn.hierarchy_status)} **${client.tls.phrase(user, "menu.botoes.usar_hierarquia")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild.warn.hierarchy_timed)} **${client.tls.phrase(user, "mode.warn.com_validade")}**\n${client.emoji(47)} **${client.tls.phrase(user, "menu.botoes.anotacoes")}: \`${guild.warn.hierarchy_strikes}\`**\n${client.emoji(47)} **${client.tls.phrase(user, "mode.warn.advertencias")}: \`${advertencias.length} / 5\`**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("telephone")} **${client.tls.phrase(user, "menu.botoes.painel_de_controle")}**`,
                value: `${guild.warn.hierarchy_channel ? `${client.emoji("icon_id")} \`${guild.warn.hierarchy_channel}\`\n( <#${guild.warn.hierarchy_channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "mode.warn.validade")}**`,
                value: `:wastebasket: **${client.tls.phrase(user, "mode.warn.expira_em")} \`${client.tls.phrase(user, `menu.times.${defaultEraser[guild.warn.hierarchy_reset]}`)}\`**${guild.warn.hierarchy_timed ? "" : `\n( **⛔ ${client.tls.phrase(user, "mode.warn.no_momento")}** )`}`,
                inline: true
            },
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ModerateMembers))} **${client.tls.phrase(user, "mode.network.castigar_membros")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
                inline: true
            },
            {
                name: "⠀",
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))} **${client.tls.phrase(user, "mode.network.banir_membros")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.KickMembers))} **${client.tls.phrase(user, "mode.network.expulsar_membros")}**`,
                inline: true
            }
        )
        .setFooter({
            text: texto_rodape,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    botoes = botoes.concat([
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "menu.botoes.usar_hierarquia"), type: client.execute("functions", "emoji_button.type_button", guild.warn.hierarchy_status), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.hierarchy_status), data: "1", disabled: !guild.warn.hierarchy_channel },
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "mode.warn.com_validade"), type: client.execute("functions", "emoji_button.type_button", guild.warn.hierarchy_timed), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.hierarchy_timed), data: "2" },
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "menu.botoes.avisos_previos"), type: 1, emoji: default_emoji["numbers"][guild.warn.hierarchy_strikes], data: "4" }
    ])

    const row = [
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_warns.0" },
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "menu.botoes.painel_de_controle"), type: 1, emoji: client.defaultEmoji("telephone"), data: "5" },
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "menu.botoes.expiracao"), type: 1, emoji: client.defaultEmoji("time"), data: "6" }
    ]

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons(row, interaction)],
        ephemeral: true
    })
}