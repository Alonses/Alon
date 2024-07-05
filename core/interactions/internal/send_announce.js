const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { createGame, verifyInvalidGames, verifyGame } = require('../../database/schemas/Game')

const dispara_anuncio = require('../../auto/send_announcement')

module.exports = async ({ client, interaction }) => {

    client.notify(process.env.channel_feeds, { content: ":video_game: :sparkles: | Disparando manualmente os anúncios de jogos gratuitos." })

    fetch(`${process.env.url_apisal}/games?reload=1`) // Forçando o update da API
        .then(response => response.json())
        .then(async objetos_anunciados => {

            // Status desconhecido ou sem link de anúncio
            if (objetos_anunciados.status === "501" || objetos_anunciados.status === "404")
                return client.notify(process.env.channel_feeds, { content: ":stop_sign: | Houve um problema com o anúncio automático, verifique a APISAL." })

            if (objetos_anunciados.length === 0)
                return client.notify(process.env.channel_feeds, { content: ":stop_sign: | Não há jogos gratuitos disponíveis na Epic Games atualmente." })

            if (await verifyGame(client, objetos_anunciados[0])) // Verificando se há jogos repetidos informados
                return client.notify(process.env.channel_feeds, { content: ":stop_sign: | Envio de anúncio de jogos cancelado, há jogos repetidos sendo enviados." })

            // Registrando os games no banco
            objetos_anunciados.forEach(async game => {
                game.expira = client.timestamp(game.expire, game.hora_expira)
                await createGame(client, game)
            })

            // Verificando pelos games que já expiraram
            await verifyInvalidGames(client)
            dispara_anuncio({ client, objetos_anunciados })

            interaction.reply({
                content: ":video_game: | Anúncio de jogos gratuitos enviado para os canais clientes!",
                ephemeral: true
            })
        })
        .catch(err => {
            client.error(err, "Games")
        })
}