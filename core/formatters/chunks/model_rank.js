const { EmbedBuilder } = require('discord.js')

const { busca_badges } = require('../../data/user_badges')

const { getRankGlobal } = require('../../database/schemas/User_rank_global')
const { getRankServer } = require('../../database/schemas/User_rank_guild')

const { medals, badgeTypes } = require('../patterns/user')

let paginas, pagina

module.exports = async ({ client, user, interaction, pagina_guia, caso, defer, autor_original }) => {

    let usuario_alvo = [], i = 0, data_usuarios, remover = 0
    const usernames = [], experiencias = [], levels = [], ids = [], deferido = defer ? true : false

    if (typeof pagina_guia === "undefined") {
        escopo = interaction.options.getString("scope")
        pagina = interaction.options.getInteger("page") || 1
    } else {
        escopo = caso
        pagina = pagina_guia
    }

    // Coleta o ID do usuário mencionado
    data_usuarios = await (escopo === "server" ? getRankServer(interaction.guild.id) : getRankGlobal())
    let rodape = interaction.user.username, user_alvo_data

    if (interaction.options?.getUser("user")) // Usuário alvo definido
        user_alvo_data = interaction.options?.getUser("user")

    // Sem dados salvos no banco de ranking para o servidor especificado
    if (!data_usuarios)
        return client.tls.editReply(interaction, user, "dive.rank.error_2", client.decider(user?.conf.ghost_mode, 0), 1)

    // Verificando a quantidade de entradas e estimando o número de páginas
    paginas = Math.ceil(data_usuarios.length / 6)

    if (!user_alvo_data) {
        if (pagina > paginas) // Número de página escolhida maior que as disponíveis
            return client.tls.editReply(interaction, user, "dive.rank.error_1", client.decider(user?.conf.ghost_mode, 0), 1)

        // Removendo os usuários respectivos as primeiras páginas
        remover = pagina === paginas ? (pagina - 1) * 6 : data_usuarios.length % 6 !== 0 ? pagina !== 2 ? (pagina - 1) * 6 : (pagina - 1) * 6 : (pagina - 1) * 6

        for (let x = 0; x < remover; x++)
            data_usuarios.shift()
    }

    if (paginas > 1 && !user_alvo_data)
        rodape = `( ${pagina} | ${paginas} ) - ${paginas}`

    for (const user_interno of data_usuarios) {
        if (user_alvo_data)
            if (user_interno.uid === user_alvo_data.id) {
                usuario_alvo.push(user_interno.xp)
                break
            }

        if (i < 6) {

            let fixed_badge = ""

            if (client.cached.fixed_badges[user_interno.uid]) // Procurando a Badge fixada do usuário
                fixed_badge = busca_badges(client, badgeTypes.SINGLE, client.cached.fixed_badges[user_interno.uid]).emoji

            const nome_usuario = user_interno.nickname ? user_interno.nickname : client.tls.phrase(user, "util.steam.undefined")

            if (parseInt(pagina) !== 1)
                usernames.push(`${client.defaultEmoji("person")} #${remover + i + 1} \`${(nome_usuario).replace(/ /g, "")}\` ${fixed_badge}`)
            else
                usernames.push(`${medals[i] || ":medal:"} #${i + 1} \`${(nome_usuario).replace(/ /g, "")}\` ${fixed_badge}`)

            ids.push(user_interno.uid)
            experiencias.push(`\`${client.locale(parseInt(user_interno.xp))} EXP\``)

            if (escopo === "server")
                levels.push(`\`${client.locale(Math.floor(user_interno.xp / 1000))}\` - \`${((user_interno.xp % 1000) / 1000).toFixed(2)}%\``)

            // Verifica se a entrada é um ID
            if (!user_alvo_data) i++
        }
    }

    if (user_alvo_data)
        return retorna_card_alvo({ client, user, interaction, usuario_alvo, user_alvo_data })

    // Exibindo o rank do servidor ou global
    retorna_ranking({ client, user, interaction, ids, usernames, experiencias, levels, rodape, escopo, autor_original, deferido })
}

async function retorna_ranking({ client, user, interaction, ids, usernames, experiencias, levels, rodape, escopo, autor_original, deferido }) {

    // Apenas é mostrado caso seja verificação por servidor
    let descricao_banner = `${client.tls.phrase(user, "dive.rank.nivel_descricao")} 🎉\n-----------------------\n`
    let nome_embed = `${client.tls.phrase(user, "dive.rank.rank_sv")} ${interaction.guild.name}`

    if (paginas > 1) rodape = `${rodape} ${client.tls.phrase(user, "dive.rank.rodape")}`
    else rodape = null

    if (escopo !== "server") {
        descricao_banner = ""
        nome_embed = client.tls.phrase(user, "dive.rank.rank_global")
    }

    const embed = new EmbedBuilder()
        .setTitle(nome_embed)
        .setColor(client.embed_color(user.misc.color))
        .setThumbnail(interaction.guild.iconURL({ size: 2048 }))
        .setDescription(client.replace(`\`\`\`fix\n${descricao_banner}   >✳️> auto_replX EXP <✳️<\`\`\``, client.cached.ranking_value))
        .addFields(
            {
                name: `${client.emoji("mc_wax")} ${client.tls.phrase(user, "dive.rank.enceirados")}`,
                value: usernames.join("\n"),
                inline: true
            },
            {
                name: `:postal_horn: **${client.tls.phrase(user, "dive.rank.experiencia")}**`,
                value: experiencias.join("\n"),
                inline: true
            }
        )

    if (rodape)
        embed.setFooter({
            text: rodape,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (escopo === "server")
        embed.addFields(
            {
                name: `:beginner: **${client.tls.phrase(user, "dive.rank.nivel")}**`,
                value: levels.join("\n"),
                inline: true
            }
        )

    let row = []
    const b_disabled = require("../../functions/rank_navigation")({ pagina, paginas, ids, interaction })

    const obj = {
        embeds: [embed],
        ephemeral: autor_original ? client.decider(user?.conf.ghost_mode, 0) : true
    }

    if (paginas > 1) { // Ranking com várias páginas de navegação
        row = client.create_buttons([
            { id: "rank_button", name: '⏪', type: 1, data: `1|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[0] },
            { id: "rank_button", name: '◀️', type: 1, data: `2|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[1] },
            { id: "rank_button", name: '🔘', type: 0, data: `3|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[2] },
            { id: "rank_button", name: '▶️', type: 1, data: `4|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[3] },
            { id: "rank_button", name: '⏩', type: 1, data: `5|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[4] }
        ], interaction)

        obj.components = [row]
    }

    return client.reply(interaction, obj, deferido)
}

async function retorna_card_alvo({ client, user, interaction, usuario_alvo, user_alvo_data }) {

    if (usuario_alvo.length === 0)
        usuario_alvo.push(0)

    const user_a = await client.getUser(user_alvo_data.id, { misc: true })
    let fixed_badge = busca_badges(client, badgeTypes.FIXED, user_a) || ""

    if (fixed_badge) fixed_badge = fixed_badge.emoji

    const embed = new EmbedBuilder()
        .setTitle(`${user_alvo_data.username} ${fixed_badge}`)
        .setColor(client.embed_color(user_a.misc.color))
        .setThumbnail(user_alvo_data.avatarURL({ dynamic: true, size: 2048 }))
        .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    embed.addFields(
        {
            name: `:postal_horn: ${client.tls.phrase(user, "dive.rank.experiencia")}`,
            value: `\`${client.locale(parseInt(usuario_alvo[0]))} EXP\``,
            inline: true
        },
        {
            name: `:beginner: ${client.tls.phrase(user, "dive.rank.nivel")}`,
            value: `\`${client.locale(parseInt(usuario_alvo[0] / 1000))}\` - \`${((usuario_alvo[0] % 1000) / 1000).toFixed(2)}%\``,
            inline: true
        }
    )

    interaction.editReply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}