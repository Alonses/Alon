const { EmbedBuilder } = require('discord.js')

const { getTimedRoleAssigner } = require('../../database/schemas/User_roles')

const { defaultRoleTimes } = require('../../formatters/patterns/timeout')

module.exports = async ({ client, interaction, dados }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const user_alvo = interaction.options?.getUser("user") || dados
    const role = await getTimedRoleAssigner(client, user_alvo.id, interaction.guild.id)

    const razao = role.relatory ? `\n\`\`\`fix\n${role.relatory}\`\`\`` : "\n```fix\nSem motivo informado```"

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.timed_roles.titulo")} :passport_control:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "mode.timed_roles.descricao")}${razao}`)
        .addFields(
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${role.user_id}\`\n( <@${role.user_id}> )`,
                inline: true
            },
            {
                name: `${client.emoji("mc_name_tag")} **${client.tls.phrase(user, "mode.roles.cargo_selecionado")}**`,
                value: `<@&${role.role_id}>`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "menu.botoes.expiracao")}**`,
                value: role.timeout ? `\`${client.tls.phrase(user, `menu.times.${defaultRoleTimes[role.timeout]}`)}\`` : `\`${client.tls.phrase(user, "mode.timed_roles.sem_expiracao")}\``,
                inline: true
            }
        )

    const row = [
        { id: "role_timed_assigner", name: client.tls.phrase(user, "mode.anuncio.cargo"), type: 1, emoji: client.emoji("mc_name_tag"), data: `2.${role.user_id}` },
        { id: "role_timed_assigner", name: client.tls.phrase(user, "menu.botoes.expiracao"), type: 1, emoji: client.defaultEmoji("time"), data: `3.${role.user_id}` }
    ]

    if (role.timeout !== null) // Só libera a função caso um tempo seja selecionado
        row.push({ id: "role_timed_assigner", name: client.tls.phrase(user, "menu.botoes.conceder"), type: 2, emoji: client.emoji(10), data: `1.${role.user_id}` })

    row.push({ id: "role_timed_assigner", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0.${role.user_id}` })

    client.reply(interaction, {
        embeds: [embed],
        components: [client.create_buttons(row, interaction)],
        ephemeral: true
    })
}