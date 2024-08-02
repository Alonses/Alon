const { EmbedBuilder } = require('discord.js')

const { busca_badges } = require('../../data/user_badges')
const { getRankMoney } = require('../../database/schemas/User')

const { badgeTypes, medals } = require('../patterns/user')

let paginas, pagina, last_update

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    const usernames = [], bufunfas = [], ids = []
    const date1 = new Date()
    let rodape = interaction.user.username, i = 0, user_alvo_data = interaction.options?.getUser("user") || null

    if (user_alvo_data) // Redirecionando o usuário para o banco padrão
        return require(`../../../commands/miscellanea/subcommands/bank_statement`)({ client, user, interaction })

    if (!last_update) { // Utiliza os dados do cache
        client.cached.rank.bank = await getRankMoney(client)
        last_update = client.timestamp()
    }

    // Atualiza os dados do cache para o ranking do banco
    if (last_update && client.timestamp() > last_update + 10000) {
        client.cached.rank.bank = await getRankMoney(client)
        last_update = client.timestamp()
    }

    // Trazendo os dados do cache para o bot
    const data_usuarios = [].concat(client.cached.rank.bank)

    // Enviado pelos botões de interação
    if (typeof dados !== "undefined") pagina = parseInt(dados)
    else pagina = interaction.options.getInteger("page") || 1

    // Sem dados no ranking do banco
    if (!data_usuarios) return client.tls.reply(interaction, user, "dive.rank.error_2", true, 1)

    // Verificando a quantidade de entradas e estimando o número de páginas
    paginas = Math.ceil(data_usuarios.length / 6)

    if (pagina > paginas) // Número de página escolhida maior que as disponíveis
        return client.tls.reply(interaction, user, "dive.rank.error_1", true, 1)

    // Removendo os usuários respectivos as primeiras páginas
    remover = pagina === paginas ? (pagina - 1) * 6 : data_usuarios.length % 6 !== 0 ? pagina !== 2 ? (pagina - 1) * 6 : (pagina - 1) * 6 : (pagina - 1) * 6

    for (let x = 0; x < remover; x++)
        data_usuarios.shift()

    if (paginas > 1)
        rodape = `( ${pagina} | ${paginas} ) - ${paginas}`

    for (const user_int of data_usuarios) {
        if (i < 6) {

            let fixed_badge = busca_badges(client, badgeTypes.FIXED, user_int) || ""
            if (fixed_badge) fixed_badge = fixed_badge.emoji

            if (parseInt(pagina) !== 1) usernames.push(`${client.defaultEmoji("person")} #${remover + i + 1} \`${((user_int.nick)?.replace(/ /g, "") || client.tls.phrase(user, "util.steam.undefined"))}\` ${fixed_badge}`)
            else usernames.push(`${medals[i] || ":medal:"} #${i + 1} \`${((user_int.nick)?.replace(/ /g, "") || client.tls.phrase(user, "util.steam.undefined"))}\` ${fixed_badge}`)

            ids.push(`\`${user_int.uid}\``)
            bufunfas.push(`\`B$ ${client.locale(parseInt(user_int.misc.money))}\``)

            i++
        }
    }

    // Rodapé do Embed de ranking
    rodape = paginas > 1 ? `${rodape} ${client.tls.phrase(user, "dive.rank.rodape")}` : rodape
    let daily = `:bank: ${client.tls.phrase(user, "misc.banco.dica_comando")} ${client.emoji("emojis_dancantes")}`

    if (user.misc.daily) {
        const tempo_restante = Math.floor((date1.getTime() + (((23 - date1.getHours()) * 3600000) + ((59 - date1.getMinutes()) * 60000) + ((60 - date1.getSeconds()) * 1000))) / 1000)

        daily = `:bank: ${client.tls.phrase(user, "misc.banco.daily")} <t:${tempo_restante}:R>\n( <t:${tempo_restante}:f> )`
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "misc.banco.rank_titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(daily)
        .addFields(
            {
                name: `${client.emoji("mc_wax")} ${client.tls.phrase(user, "dive.rank.enceirados")}`,
                value: usernames.join("\n"),
                inline: true
            },
            {
                name: `${client.emoji("mc_esmeralda")} **Bufunfas**`,
                value: bufunfas.join("\n"),
                inline: true
            },
            {
                name: `${client.emoji("icon_id")} **${client.tls.phrase(user, "mode.report.identificador")}**`,
                value: ids.join("\n"),
                inline: true
            }
        )
        .setFooter({
            text: rodape,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    let row = []
    const b_disabled = require("../../functions/rank_navigation")({ pagina, paginas, ids, interaction })

    const obj = {
        embeds: [embed],
        ephemeral: autor_original ? client.decider(user?.conf.ghost_mode, 0) : true
    }

    if (paginas > 1) {
        row = client.create_buttons([
            { id: "rank_bank_button", name: '⏪', type: 1, data: `1|${pagina}.rank_bank_navegar`, disabled: b_disabled[0] },
            { id: "rank_bank_button", name: '◀️', type: 1, data: `2|${pagina}.rank_bank_navegar`, disabled: b_disabled[1] },
            { id: "rank_bank_button", name: '🔘', type: 0, data: `3|${pagina}.rank_bank_navegar`, disabled: b_disabled[2] },
            { id: "rank_bank_button", name: '▶️', type: 1, data: `4|${pagina}.rank_bank_navegar`, disabled: b_disabled[3] },
            { id: "rank_bank_button", name: '⏩', type: 1, data: `5|${pagina}.rank_bank_navegar`, disabled: b_disabled[4] }
        ], interaction)

        obj.components = [row]
    }

    if (!autor_original) interaction.customId = null

    return client.reply(interaction, obj)
}