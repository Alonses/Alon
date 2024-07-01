const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client }) => {

    const date1 = new Date(), bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })

    // Ficará esperando até meia noite para executar a rotina
    const proxima_att = ((23 - date1.getHours()) * 3600000) + ((60 - date1.getMinutes()) * 60000) + ((60 - date1.getSeconds()) * 1000)

    let canais_texto = client.channels(0).size, members = 0, processamento = ""

    client.guilds().forEach(async guild => { members += guild.memberCount - 1 })
    const used = process.memoryUsage()

    for (let key in used)
        processamento += `${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\n`

    const embed = new EmbedBuilder()
        .setTitle("> Resumo diário :mega:")
        .setColor(0x29BB8E)
        .setDescription(`\`\`\`fix\n🎲 Processamento\n${processamento}\`\`\``)
        .addFields(
            {
                name: ":gear: **Comandos**",
                value: `:dart: **Hoje:** \`${client.locale(bot.cmd_ativacoes)}\`\n:octagonal_sign: **Erros:** \`${client.locale(bot.cmd_erros)}\``,
                inline: true
            },
            {
                name: ":medal: **Experiência**",
                value: `:dart: **Hoje:** \`${client.locale(bot.exp_concedido)}\``,
                inline: true
            },
            {
                name: ":e_mail: **Mensagens**",
                value: `:dart: **Hoje:** \`${client.locale(bot.msgs_lidas)}\`\n:white_check_mark: **Válidas:** \`${client.locale(bot.msgs_validas)}\``,
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.emoji("icon_slash_commands")} **Interações**`,
                value: `:mouse_three_button: **Botões:** \`${(client.locale(bot.cmd_botoes))}\`\n:card_box: **Menus: **\`${client.locale(bot.cmd_menus)}\``,
                inline: true
            },
            {
                name: ":globe_with_meridians: **Servidores**",
                value: `:busts_in_silhouette: **Usuários: **\`${client.locale(members)}\`\n:diamond_shape_with_a_dot_inside: **Ativo em:** \`${client.locale(client.guilds().size)}\`\n${client.defaultEmoji("paper")} **Canais: **\`${client.locale(canais_texto)}\``,
                inline: true
            },
            {
                name: ":bank: Bufunfas",
                value: `${client.emoji("mc_esmeralda")} **Distribuídas:** \`${client.locale(bot.bfu_gerado)}\`\n:money_with_wings: **Movimentado:** \`${client.locale(bot.bfu_movido)}\`\n:dollar: **Recolhido:** \`${client.locale(bot.bfu_reback)}\``,
                inline: true
            }
        )
        .addFields({
            name: `:sparkles: Próximo update <t:${Math.floor((date1.getTime() + proxima_att) / 1000)}:R>`,
            value: `<t:${Math.floor((date1.getTime() + proxima_att) / 1000)}:f>`,
            inline: false
        })
        .addFields({
            name: ":satellite: Ativo desde",
            value: `<t:${Math.floor(client.discord.readyTimestamp / 1000)}:f>\n<t:${Math.floor(client.discord.readyTimestamp / 1000)}:R>`,
            inline: false
        })

    return embed
}