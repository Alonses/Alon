const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { defaultRoleTimes } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, message, guild, strike_aplicado, indice_matriz, user_messages, mensagens_spam, user, user_guild, guild_bot, tempo_timeout }) => {

    // Verificando se a hierarquia do bot é maior que a do membro e se o bot pode mutar membros
    if (!await client.permissions(message, client.id(), [PermissionsBitField.Flags.MuteMembers]) || guild_bot.roles.highest.position <= user_guild.roles.highest.position)
        return client.notify(guild.spam.channel || guild.logger.channel, { content: client.tls.phrase(guild, "mode.spam.falta_permissoes_2", client.defaultEmoji("guard"), `<@${user_guild.id}>`) })

    // Criando o embed de aviso para os moderadores
    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(guild, "mode.spam.titulo")} ( ${(strike_aplicado?.rank || 0) + 1} / ${indice_matriz} )`)
        .setColor(0xED4245)
        .setDescription(`${client.tls.phrase(guild, "mode.spam.spam_aplicado", client.defaultEmoji("guard"), [user_guild.user.username, client.tls.phrase(guild, `menu.times.${tempo_timeout}`)])}\n\`\`\`${mensagens_spam}\`\`\``)
        .addFields(
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(guild, "util.server.membro")}**`,
                value: `${client.emoji("icon_id")} \`${user_guild.id}\`\n${client.emoji("mc_name_tag")} \`${user_guild.user.username}\`\n( ${user_guild} )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(guild, "mode.spam.vigencia")}**`,
                value: `**${client.tls.phrase(guild, "mode.warn.expira_em")} \`${client.tls.phrase(guild, `menu.times.${tempo_timeout}`)}\`**\n( <t:${client.timestamp() + tempo_timeout}:f> )`,
                inline: true
            }
        )

    // Strike possui um cargo vinculado
    if (strike_aplicado.role)
        embed.addFields({
            name: `${client.defaultEmoji("playing")} **${client.tls.phrase(guild, "mode.spam.cargo_acrescentado")}**`,
            value: `:label: <@&${strike_aplicado.role}>${strike_aplicado.timed_role.status ? `\n( \`${client.defaultEmoji("time")} ${client.tls.phrase(guild, `menu.times.${defaultRoleTimes[strike_aplicado.timed_role.timeout]}`)}\` )` : ""}`,
            inline: true
        })

    if (user_guild.user.avatarURL({ dynamic: true }))
        embed.setThumbnail(user_guild.user.avatarURL({ dynamic: true }))

    // Mutando o usuário causador do spam
    user_guild.timeout(tempo_timeout * 1000, client.tls.phrase(guild, "mode.spam.justificativa_mute"))
        .then(async () => {

            const obj = {
                content: client.tls.phrase(guild, "mode.spam.ping_spam", null, `<@${user_guild.id}>`),
                embeds: [embed]
            }

            if (guild.spam.notify) // Servidor com ping de spam ativado
                obj.content = `@here ${obj.content}`

            client.notify(guild.spam.channel || guild.logger.channel, obj)

            const embed_user = new EmbedBuilder()
                .setTitle(`${client.tls.phrase(user, "mode.spam.spam_titulo_user")} ( ${(strike_aplicado?.rank || 0) + 1} / ${indice_matriz} )`)
                .setColor(0xED4245)

            let msg_user = `${client.tls.phrase(user, "mode.spam.silenciado", null, await client.guilds().get(guild.sid).name)} \`\`\`${mensagens_spam}\`\`\``

            if (`${user_messages[0].content} `.match(client.cached.regex))
                msg_user += `\n${client.defaultEmoji("detective")} | ${client.tls.phrase(user, "mode.spam.aviso_links")}`

            embed_user.setDescription(msg_user)
            embed_user.addFields(
                {
                    name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(user, "mode.spam.vigencia")}**`,
                    value: `**${client.tls.phrase(user, "mode.warn.expira_em")} \`${client.tls.phrase(user, `menu.times.${tempo_timeout}`)}\`**`,
                    inline: true
                },
                {
                    name: "⠀",
                    value: `( <t:${client.timestamp() + tempo_timeout}:f> )`,
                    inline: true
                }
            )

            if (strike_aplicado.role) // Strike possui um cargo vinculado
                embed_user.addFields({
                    name: client.tls.phrase(user, "mode.spam.cargo_acrescentado"),
                    value: `:label: <@&${strike_aplicado.role}>${strike_aplicado.timed_role.status ? `\n( \`${client.defaultEmoji("time")} ${client.tls.phrase(user, `menu.times.${defaultRoleTimes[strike_aplicado.timed_role.timeout]}`)}\` )` : ""}`,
                    inline: true
                })

            client.sendDM(user.id, { embeds: [embed_user] }, true)
        })
        .catch(console.error)
}