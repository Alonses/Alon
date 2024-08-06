const { EmbedBuilder } = require('discord.js')

const { getUserReports } = require('../../database/schemas/User_reports')
const { getUserStrikes } = require("../../database/schemas/User_strikes")
const { listAllUserWarns } = require('../../database/schemas/User_warns')
const { listAllGuildWarns } = require('../../database/schemas/Guild_warns')

module.exports = async ({ client, user, interaction, id_cache }) => {

    let id_alvo = id_cache || interaction.options.getUser("user").id
    const user_alvo = await client.getMemberGuild(interaction, id_alvo) // Dados de membro do servidor
        .catch(() => { return null })

    // Usuário não faz parte do servidor (caso o usuário saia do servidor enquanto o comando é executado)
    if (!user_alvo) return client.tls.reply(interaction, user, "mode.report.usuario_nao_encontrado", true, 1)

    // Coletando os dados de histórico do usuário
    const reports = await getUserReports(id_alvo)
    const user_c = await client.getUser(id_alvo, { misc: true })

    let apelido = user_alvo.nickname !== null ? user_alvo.nickname : user_alvo.user.username
    let avisos = 0, descricao = `\`\`\`✅ | ${client.tls.phrase(user, "mode.report.sem_report")}\`\`\``

    let user_name = `\`${user_alvo.user.username.replace(/ /g, "")}#${user_alvo.user.discriminator}\`\n( ${user_alvo} )`

    if (user_alvo.user.discriminator === 0)
        user_name = `\`${user_alvo.user.username.replace(/ /g, "")}\`\n( ${user_alvo} )`

    // Avatar do usuário
    const avatar_user = user_alvo.user.avatarURL({ dynamic: true, size: 2048 }), historico = []
    const strikes = await getUserStrikes(id_alvo, interaction.guild.id)

    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)
    const warns = await listAllUserWarns(client, id_alvo, interaction.guild.id)

    let indice_matriz = client.verifyMatrixIndex(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

    // Quantificando os relatórios sobre o usuário
    reports.forEach(valor => {
        avisos++

        historico.push(`-> ${new Date(valor.timestamp * 1000).toLocaleString("pt-BR")} | ${valor.relatory}`)
    })

    if (avisos > 0)
        descricao = `\`\`\`${client.tls.phrase(user, "mode.report.com_report", 4)}\n\n${historico.join("\n").slice(0, 1000)}\`\`\``

    if (warns.length > 0)
        descricao += `\`\`\`${client.tls.phrase(user, "mode.report.com_registro", 58)}\`\`\``

    const timestamp = user_alvo.joinedTimestamp / 1000

    const infos_user = new EmbedBuilder()
        .setTitle(`> ${apelido}`)
        .setColor(client.embed_color(user_c.misc.color))
        .setDescription(descricao)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${id_alvo}\`\n${user_name}`,
                inline: true
            },
            {
                name: `**:mega: Warns: ${warns.length} / ${indice_matriz}**`,
                value: `:name_badge: **Strikes: ${strikes.strikes}**\n:man_guard: **${client.tls.phrase(user, "mode.report.reporte")}: ${avisos}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(user, "util.user.entrada")}**`,
                value: `<t:${parseInt(timestamp)}:F>\n( <t:${Math.floor(timestamp)}:R> )`,
                inline: false
            }
        )

    if (avatar_user)
        infos_user.setThumbnail(avatar_user)

    const obj = {
        embeds: [infos_user],
        components: [],
        ephemeral: true
    }

    const botoes = []

    if (strikes.strikes > 0) // Botão para resetar os strikes do usuário no servidor
        botoes.push({ id: "user_reset_strikes", name: client.tls.phrase(user, "menu.botoes.remover_strikes"), type: 1, emoji: client.emoji(42), data: `2|${id_alvo}` })

    if (warns.length > 0) // Botão para resetar os warns do usuário no servidor
        botoes.push(
            { id: "user_reset_warns", name: client.tls.phrase(user, "menu.botoes.remover_advertencias"), type: 1, emoji: client.emoji(42), data: `2|${id_alvo}` },
            { id: "panel_guild_browse_warns", name: client.tls.phrase(user, "menu.botoes.gerenciar_advertencias"), type: 1, emoji: client.emoji(41), data: `0|${id_alvo}` }
        )

    if (botoes.length > 0)
        obj.components = [client.create_buttons(botoes, interaction)]

    client.reply(interaction, obj)
}