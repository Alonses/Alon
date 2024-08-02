const { EmbedBuilder } = require("discord.js")

const { defaultRoleTimes } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, guild, strike_aplicado, indice_matriz, user_messages, mensagens_spam, user, user_guild }) => {

    // Criando o embed de aviso para os moderadores
    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(guild, "mode.spam.titulo")} ( ${(strike_aplicado?.rank || 0) + 1} / ${indice_matriz} )`)
        .setColor(0xED4245)
        .setDescription(`${client.tls.phrase(guild, "mode.spam.spam_detectado", client.defaultEmoji("guard"), user_guild.user.username)}\n\`\`\`${mensagens_spam}\`\`\``)
        .addFields(
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(guild, "util.server.membro")}**`,
                value: `${client.emoji("icon_id")} \`${user_guild.id}\`\n${client.emoji("mc_name_tag")} \`${user_guild.user.username}\`\n( ${user_guild} )`,
                inline: true
            }
        )

    // Strike possui um cargo vinculado
    if (strike_aplicado.role)
        embed.addFields({
            name: client.tls.phrase(guild, "mode.spam.cargo_acrescentado"),
            value: `:label: <@&${strike_aplicado.role}>${strike_aplicado.timed_role.status ? `\n( \`${client.defaultEmoji("time")} ${client.tls.phrase(guild, `menu.times.${defaultRoleTimes[strike_aplicado.timed_role.timeout]}`)}\` )` : ""}`,
            inline: true
        })

    if (user_guild.user.avatarURL({ dynamic: true, size: 2048 }))
        embed.setThumbnail(user_guild.user.avatarURL({ dynamic: true, size: 2048 }))

    // Notificando o membro capturado pelo spam
    const obj = {
        content: client.tls.phrase(guild, "mode.spam.ping_capturado", null, `<@${user_guild.id}>`),
        embeds: [embed]
    }

    // Servidor com ping de spam ativado
    if (guild.spam.notify) obj.content = `@here ${obj.content}`

    client.notify(guild.spam.channel || guild.logger.channel, obj)

    const embed_user = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.spam.spam_titulo_user")} ( ${(strike_aplicado?.rank || 0) + 1} / ${indice_matriz} )`)
        .setColor(0xED4245)

    let msg_user = `${client.tls.phrase(user, "mode.spam.capturado", null, await client.guilds().get(guild.sid).name)} \`\`\`${mensagens_spam}\`\`\``

    if (strike_aplicado.role) // Strike possui um cargo vinculado
        embed_user.addFields({
            name: client.tls.phrase(user, "mode.spam.cargo_acrescentado"),
            value: `:label: <@&${strike_aplicado.role}>${strike_aplicado.timed_role.status ? `\n( \`${client.defaultEmoji("time")} ${client.tls.phrase(user, `menu.times.${defaultRoleTimes[strike_aplicado.timed_role.timeout]}`)}\` )` : ""}`,
            inline: true
        })

    // Verificando se há links anexados ao spam
    if (`${user_messages[0].content} `.match(client.cached.regex))
        msg_user += `\n${client.defaultEmoji("detective")} | ${client.tls.phrase(user, "mode.spam.aviso_links")}`

    embed_user.setDescription(msg_user)
    client.sendDM(user.id, { embeds: [embed_user] }, true)
}