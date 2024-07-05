const { EmbedBuilder } = require('discord.js')

const { getGames, verifyInvalidGames } = require("../../database/schemas/Game")

const { redes } = require('../../../files/json/text/anuncio.json')

module.exports = async (client, user, interaction, pagina_guia) => {

    // Verificando pelos games que já expiraram
    await verifyInvalidGames(client)

    // Listando os games que estão gratuitos no momento
    const games = await getGames(client), original_size = games.length
    let jogos_disponiveis = [], objeto_jogos = [], limitador = 3
    let pagina = pagina_guia || 0

    if (games.length < 1) // Sem games para anunciar no momento
        if (interaction) return client.tls.reply(interaction, user, "mode.anuncio.sem_games", true, client.emoji("this_cannot_be_happening"))
        else client.sendDM(user, { content: client.tls.phrase(user, "mode.anuncio.sem_games", client.emoji("this_cannot_be_happening")) }, true)

    for (let i = 0; i < pagina; i++)
        for (let x = 0; x < limitador; x++)
            games.shift()

    if (interaction)
        if (games.length > limitador)
            objeto_jogos.push({ id: "free_games", name: client.tls.phrase(user, "menu.botoes.proximo"), emoji: client.emoji(41), type: 0, data: `1.${pagina}` })
        else if ((pagina * limitador) < original_size && games.length !== original_size)
            objeto_jogos.push({ id: "free_games", name: client.tls.phrase(user, "menu.botoes.inicio"), emoji: client.emoji(57), type: 0, data: `0.${pagina}` })

    games.forEach(game => {
        // Jogo com tempo válido para resgate
        if (game.expira > client.timestamp()) {
            const nome_jogo = game.nome.length > 20 ? `${game.nome.slice(0, 20)}...` : game.nome
            const matches = game.link.match(/epicgames.com|store.steam|gog.com|humblebundle.com|ubisoft.com|store.ubi.com|xbox.com|play.google|beta.bandainamcoent|microsoft.com/)
            let preco = `R$ ${game.preco}`, logo_plataforma = client.emoji(redes[matches[0]][0])

            if (game.preco === 0)
                preco = client.tls.phrase(user, "mode.anuncio.ficara_pago")

            if (jogos_disponiveis.length < limitador) {

                // Verificando a expiração do game e alterando a exibição
                const emoji = game.expira - client.timestamp() < 172800 ? client.defaultEmoji("running") : client.defaultEmoji("gamer")
                const expiracao = game.expira - client.timestamp() < 172800 ? `\n( ${client.defaultEmoji("running")} ${client.tls.phrase(user, "menu.botoes.expirando")} <t:${game.expira}:R> )` : ""
                jogos_disponiveis.push(`- \`${game.nome}\`\n[ ${logo_plataforma} \`${preco}\` | ${client.tls.phrase(user, "mode.anuncio.ate_data")} <t:${game.expira}:D> ]${expiracao}`)

                objeto_jogos.push({
                    name: nome_jogo,
                    emoji: emoji,
                    type: 4,
                    value: game.link
                })
            }
        }
    })

    let row

    // Criando os botões externos para os jogos
    if (interaction) row = client.create_buttons(objeto_jogos, interaction)
    else row = client.create_buttons(objeto_jogos)

    const embed = new EmbedBuilder()
        .setTitle(`> ${client.tls.phrase(user, "mode.anuncio.ativos")} ${client.defaultEmoji("gamer")}`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "mode.anuncio.resgate_dica")}\n\n${jogos_disponiveis.join("\n\n")}`)

    // Imagem de capa para o embed
    if (games[0]?.thumbnail) embed.setImage(games[0]?.thumbnail)
    else embed.setThumbnail("https://i.imgur.com/AEkiKGU.jpg")

    if (interaction)
        client.reply(interaction, {
            embeds: [embed],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    else {
        if (original_size > limitador) // Botões extrapolam a quantidade do limitador
            embed.setFooter({
                text: client.tls.phrase(user, "mode.anuncio.jogos_disponiveis_rodape"),
                iconURL: client.avatar()
            })

        client.sendDM(user, { embeds: [embed], components: [row] }, true)
    }
}