const { EmbedBuilder, PermissionsBitField } = require('discord.js')

async function create_profile(client, interaction, user, id_alvo, operador) {

    let user_alvo = await client.getMemberGuild(interaction, id_alvo), operacao = 0
    const membro_sv = user_alvo

    if (!user_alvo) // Usuário foi removido do cache do bot
        return interaction.update({
            content: client.tls.phrase(user, "menu.botoes.comando_desatualizado", 11),
            components: []
        })

    user_alvo = user_alvo.user

    if (typeof operador !== "undefined") operacao = operador
    const user_data = await client.getUser(id_alvo, {
        misc: true,
        profile: true
    })

    let apelido = membro_sv.nickname || user_alvo.username, tipo_user = "🤖", nota_rodape = ""
    let nome_usuario = `\`${user_alvo.username.replace(/ /g, "")}#${user_alvo.discriminator}\``

    // Usuário sem discriminador
    if (user_alvo.discriminator === 0)
        nome_usuario = `\`@${user_alvo.username.replace(/ /g, "")}\``

    let emoji_hypesquad = "⠀", discord_premium = "⠀"
    const flags_user = user_alvo.flags.toArray()

    if (!user_alvo.bot) {
        if (flags_user.includes("HypeSquadOnlineHouse1")) // HypeSquad
            emoji_hypesquad = client.emoji("squad_bravery")

        if (flags_user.includes("HypeSquadOnlineHouse2"))
            emoji_hypesquad = client.emoji("squad_brilliance")

        if (flags_user.includes("HypeSquadOnlineHouse3"))
            emoji_hypesquad = client.emoji("squad_balance")

        if (flags_user.includes("PremiumEarlySupporter"))
            discord_premium = client.emoji("early_supporter")

        if (membro_sv.premiumSinceTimestamp) // Impulsionadores do servidor
            discord_premium += ` ${client.emoji("boost")}`
    }

    if (membro_sv.permissions.has(PermissionsBitField.Flags.Administrator)) {
        tipo_user = "🛡️"
        nota_rodape = client.tls.phrase(user, "util.user.moderador")
    }

    if (!tipo_user.includes("🛡️") && !user_data.bot)
        tipo_user = client.defaultEmoji("person")

    if (user_data.id === client.id())
        nota_rodape = client.tls.phrase(user, "util.user.alonsal")

    if (process.env.ids_enceirados?.includes(user_data.id)) {
        if (nota_rodape !== "") nota_rodape += ", "

        nota_rodape += client.tls.phrase(user, "util.user.enceirado")
    }

    const embed = new EmbedBuilder()
        .setTitle(`> ${apelido} ${emoji_hypesquad} ${discord_premium}`)
        .setColor(client.embed_color(user_data.misc.color))
        .addFields(
            {
                name: `${client.emoji("icon_mention")} ${nome_usuario}`,
                value: `( <@${user_data.id}> )`,
                inline: true
            },
            {
                name: `${client.emoji("icon_id")} **${client.tls.phrase(user, "mode.report.identificador")}**`,
                value: `\`${user_data.id}\``,
                inline: true
            }
        )
        .setFooter({
            text: `${tipo_user} ${nota_rodape}`
        })

    if (operacao === 0) {

        const data_entrada = `<t:${Math.floor(membro_sv.joinedTimestamp / 1000)}:f>`
        const diferenca_entrada = `<t:${Math.floor(membro_sv.joinedTimestamp / 1000)}:R>`

        const data_criacao = `<t:${Math.floor(user_alvo.createdAt / 1000)}:f>` // Cadastro do usuário
        const diferenca_criacao = `<t:${Math.floor(user_alvo.createdAt / 1000)}:R>`

        embed.addFields(
            {
                name: `:birthday: **${client.tls.phrase(user, "util.user.conta_criada")}**`,
                value: `${data_criacao}\n( ${diferenca_criacao} )`,
                inline: false
            },
            {
                name: `:parachute: **${client.tls.phrase(user, "util.user.entrada")}**`,
                value: `${data_entrada}\n( ${diferenca_entrada} )`,
                inline: false
            }
        )

        if (user_data.profile.about) // Perfil com um "sobre" informado
            embed.setDescription(user_data.profile.about)
    }

    if (user_alvo.avatarURL({ dynamic: true, size: 2048 })) // Usuário com avatar definido
        embed.setThumbnail(user_alvo.avatarURL({ dynamic: true, size: 2048 }))

    return embed
}

module.exports.create_profile = create_profile