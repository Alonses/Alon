const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { emoji_button } = require("../../functions/emoji_button")

const { getGuildWarn } = require("../../database/schemas/Guild_warns")

const { loggerMap } = require("../../formatters/patterns/guild")
const { spamTimeoutMap, defaultRoleTimes } = require("../../formatters/patterns/timeout")
const { default_emoji } = require('../../../files/json/text/emojis.json')

module.exports = async ({ client, user, interaction, dados }) => {

    const id_warn = parseInt(dados.split(".")[2])
    const guild = await client.getGuild(interaction.guild.id)
    const warn = await getGuildWarn(interaction.guild.id, id_warn)

    if (!warn.strikes) { // Concede os strikes minimos para cada advertência conforme a configuração do servidor
        warn.strikes = guild.warn_hierarchy_strikes
        warn.save()
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.warn.edicao_warn_titulo", null, warn.rank + 1))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.warn.descricao_edicao_warn"))
        .setFields(
            {
                name: `${client.defaultEmoji("warn")} **${client.tls.phrase(user, "menu.botoes.penalidade")}**`,
                value: `**${warn.action ? `${loggerMap[warn.action]} \`${client.tls.phrase(user, `menu.events.${warn.action}`)}\`` : `📝 ${client.tls.phrase(user, "mode.warn.sem_penalidade")}`}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("role")} **${client.tls.phrase(user, "mode.anuncio.cargo")}**`,
                value: `**${warn.role ? `<@&${warn.role}>` : client.tls.phrase(user, "mode.warn.sem_cargo")}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "menu.botoes.cargo_temporario")}**`,
                value: `**${warn.timed_role.status ? `\`${client.tls.phrase(user, "status.ativo")}\` \`${client.defaultEmoji("time")} ${client.tls.phrase(user, `menu.times.${defaultRoleTimes[warn.timed_role.timeout]}`)}\`` : `\`${client.tls.phrase(user, "status.desativado")}\` \`${client.defaultEmoji("time")} ${client.tls.phrase(user, `menu.times.${defaultRoleTimes[warn.timed_role.timeout]}`)}\``}**`,
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.emoji(53)} **${client.tls.phrase(user, "menu.botoes.tempo_mute")}**`,
                value: `**${warn.timeout != null ? `${client.defaultEmoji("time")} \`${client.tls.phrase(user, `menu.times.${spamTimeoutMap[warn.timeout]}`)}\`` : client.tls.phrase(user, "mode.spam.sem_tempo_definido")}**`,
                inline: false
            }
        )

    if (guild.warn_reset)
        embed.addFields(
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "mode.warn.expiracao_status")} ( 🔀 )**`,
                value: guild.warn_timed ? `**${client.tls.phrase(user, "mode.warn.expira_em")} \`${client.tls.phrase(user, `menu.times.${spamTimeoutMap[guild.warn_reset]}`)}\`**` : `\`${client.tls.phrase(user, "mode.warn.expiracao_desligada")}\``,
                inline: false
            }
        )

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())
    let b_cargos = false

    embed.addFields(
        {
            name: `👑 **${client.tls.phrase(user, "mode.hierarquia.status_ativacao")}**`,
            value: `\`${guild.warn_hierarchy_status ? client.tls.phrase(user, "mode.hierarquia.ativo") : client.tls.phrase(user, "mode.hierarquia.desativado")}\` \`${client.defaultEmoji("paper")} ${warn.strikes || guild.warn_hierarchy_strikes} ${client.tls.phrase(user, "mode.hierarquia.anotacoes_ativacao")}\``,
            inline: false
        },
        {
            name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
            value: `${emoji_button(membro_sv.permissions.has(PermissionsBitField.Flags.ModerateMembers))} **${client.tls.phrase(user, "mode.network.castigar_membros")}**\n${emoji_button(membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
            inline: true
        },
        {
            name: "⠀",
            value: `${emoji_button(membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))} **${client.tls.phrase(user, "mode.network.banir_membros")}**\n${emoji_button(membro_sv.permissions.has(PermissionsBitField.Flags.KickMembers))} **${client.tls.phrase(user, "mode.network.expulsar_membros")}**`,
            inline: true
        }
    )

    if (warn.role)
        embed.setFooter({
            text: client.tls.phrase(user, "mode.network.cargo_vinculado"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    // Desabilitando o botão de escolher cargos
    if (!membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        b_cargos = true

        embed.setFooter({
            text: client.tls.phrase(user, "mode.network.cargo_permissao"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

        if (warn.role) { // Removendo o cargo definido anteriormente
            warn.role = null
            warn.save()
        }
    }

    const botoes = [
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.penalidade"), type: 1, emoji: loggerMap[warn.action] || loggerMap["none"], data: `1.${id_warn}` },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.tempo_mute"), type: 1, emoji: client.defaultEmoji("time"), data: `3.${id_warn}` },
        { id: "warn_configure_button", name: client.tls.phrase(user, "mode.anuncio.cargo"), type: 1, emoji: client.defaultEmoji("role"), data: `2.${id_warn}`, disabled: b_cargos },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.cargo_temporario"), type: client.execute("functions", "emoji_button.type_button", warn.timed_role.status), emoji: client.execute("functions", "emoji_button.emoji_button", warn.timed_role.status), data: `20.${id_warn}`, disabled: !warn.role },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.expiracao_cargo"), type: 1, emoji: client.defaultEmoji("time"), data: `21|${id_warn}` }
    ]

    const row = [
        { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "3" },
        { id: "warn_remove", name: client.tls.phrase(user, "menu.botoes.excluir_advertencia"), type: 3, emoji: client.emoji(13), data: `2|${id_warn}` },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.expirar"), type: client.execute("functions", "emoji_button.type_button", guild.warn_timed), emoji: client.defaultEmoji("time"), data: `11.${id_warn}` },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.usar_hierarquia"), type: client.execute("functions", "emoji_button.type_button", guild.warn_hierarchy_status), emoji: client.emoji(65), data: `10.${id_warn}`, disabled: !interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers) },
        { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.anotacoes"), type: 1, emoji: default_emoji["numbers"][warn.strikes || guild.warn_hierarchy_strikes], data: `12.${id_warn}` }
    ]

    const obj = {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons(row, interaction)],
        ephemeral: true
    }

    client.reply(interaction, obj)
}