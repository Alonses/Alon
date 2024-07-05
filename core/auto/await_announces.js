const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { createGame, verifyInvalidGames, verifyGame } = require('../database/schemas/Game')

const dispara_anuncio = require('./send_announcement')

module.exports = async ({ client }) => {

    if (client.id() !== process.env.client_1 && !client.x.status) return

    const date1 = new Date() // Ficará esperando até quinta feira ao meio dia para executar a rotina
    let controle = 0

    // Previne que o bot dispare anúncios indesejados se for atualizado após o meio dia das quintas
    if (date1.getDay() === 4 && date1.getHours() > 13)
        controle = 7

    const dias = [4, 3, 2, 1, controle, 6, 5]
    let tempo_restante = (dias[date1.getDay()] * 86400000) + ((12 - date1.getHours()) * 3600000) + ((60 - date1.getMinutes()) * 60000) + ((60 - date1.getSeconds()) * 1000)

    // Atualiza semanalmente
    let frequencia = 604800000

    // Atualização diária
    if (client.x.anuncio_diario) {
        tempo_restante = ((12 - date1.getHours()) * 3600000) + ((60 - date1.getMinutes()) * 60000) + ((60 - date1.getSeconds()) * 1000)
        frequencia = 86400000

        if (date1.getHours() > 13) // Espera até a conclusão da próxima frequência para poder enviar o anúncio
            tempo_restante = frequencia + tempo_restante
    }

    setTimeout(() => {
        gera_anuncio(client, frequencia)
        requisita_anuncio(client, frequencia)
    }, tempo_restante)
}

requisita_anuncio = (client, aguardar_tempo) => {
    setTimeout(() => {
        gera_anuncio(client, aguardar_tempo)
        requisita_anuncio(client, aguardar_tempo)
    }, aguardar_tempo)
}

gera_anuncio = async (client, proxima_att) => {

    if (process.env.client_1 === client.id())
        client.notify(process.env.channel_feeds, { content: ":video_game: :sparkles: | Disparando automaticamente os anúncios de jogos gratuitos" })

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
                game.expire = client.timestamp(game.expire, game.hora_expira)

                await createGame(client, game)
            })

            // Verificando pelos games que já expiraram
            verifyInvalidGames(client)
            dispara_anuncio({ client, objetos_anunciados })
        })
        .catch(err => {
            client.error(err, "Games")
        })

    next_att(client, proxima_att)
}

next_att = (client, tempo_restante) => {
    tempo_restante = Math.floor(client.timestamp() + (tempo_restante / 1000))

    client.notify(process.env.channel_feeds, { content: `:video_game: :sparkles: | Próxima atualização de jogos gratuitos em\n( <t:${tempo_restante}:F> )` })
}