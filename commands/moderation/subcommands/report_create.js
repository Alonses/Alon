const { EmbedBuilder } = require('discord.js')

const { getReport } = require('../../../core/database/schemas/User_reports')

module.exports = async ({ client, user, interaction }) => {

    let user_alvo = interaction.options.getUser("user")
    let id_alvo

    if (!user_alvo)
        return client.tls.reply(interaction, user, "mode.report.sem_usuario", true, client.emoji(0))

    if (typeof user_alvo === "object")
        id_alvo = user_alvo.id

    if (id_alvo === interaction.user.id) // Impede que o usuário se auto reporte
        return client.tls.reply(interaction, user, "mode.report.auto_reporte", true, client.emoji(0))

    if (id_alvo === client.id()) // Impede que o usuário reporte o bot
        return client.tls.reply(interaction, user, "mode.report.reportar_bot", true, client.emoji(0))

    if (isNaN(id_alvo) || id_alvo.length < 18) // ID inválido
        return client.tls.reply(interaction, user, "mode.report.id_invalido", true, client.defaultEmoji("types"))

    const membro_guild = await client.getMemberGuild(interaction, id_alvo)

    if (membro_guild?.user.bot) // Impede que outros bots sejam reportados
        return client.tls.reply(interaction, user, "mode.report.usuario_bot", true, client.emoji(0))

    const alvo = await getReport(id_alvo, interaction.guild.id)

    // Atribuindo o reporte ao usuário que disparou o comando
    alvo.issuer = interaction.user.id
    alvo.issuer_nick = interaction.user.username

    alvo.archived = false
    alvo.nick = user_alvo.username
    alvo.relatory = interaction.options.getString("reason")
    alvo.timestamp = client.timestamp()

    const guild = await client.getGuild(interaction.guild.id, {
        network: true,
        reports: true
    })
    let auto_ban = ""

    if (guild?.reports.auto_ban)
        auto_ban = `\n\n\`\`\`${client.tls.phrase(user, "mode.report.auto_ban_descricao", 34)}\`\`\``

    // Enviando o embed para validação
    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.report.reportado")} 🛂`)
        .setColor(0xED4245)
        .setDescription(`\`\`\`📃 | Descrição fornecida:\n\n${alvo.relatory}\`\`\`\n${client.tls.phrase(user, "mode.report.descricao_report")}${auto_ban}`)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.uid}\`\n( <@${alvo.uid}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportador")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.issuer}\`\n( <@${alvo.issuer}> )`,
                inline: true
            },
            {
                name: ":globe_with_meridians: **Server**",
                value: `${client.emoji("icon_id")} \`${alvo.sid}\`\n<t:${alvo.timestamp}:R>`,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Salvando o alvo para editar posteriormente
    await alvo.save()

    // Criando os botões para as funções de reporte
    let botoes = [{ id: "report_user", name: client.tls.phrase(user, "menu.botoes.confirmar_anunciando"), type: 2, emoji: '📣', data: `1|${alvo.uid}` }]

    if (guild.network.link) // Habilitando opção de enviar o aviso apenas aos servidores do network
        botoes.push({ id: "report_user", name: client.tls.phrase(user, "menu.botoes.anunciar_ao_network"), type: 0, emoji: client.emoji(36), data: `3|${alvo.uid}` })

    botoes.push(
        { id: "report_user", name: client.tls.phrase(user, "menu.botoes.apenas_confirmar"), type: 1, emoji: '📫', data: `2|${alvo.uid}` },
        { id: "report_user", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${alvo.uid}` }
    )

    return interaction.reply({
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}