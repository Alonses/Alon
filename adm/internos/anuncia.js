const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const dispara_anuncio = require('../../adm/funcoes/dispara_anuncio.js')

module.exports = async ({client}) => {

    if (client.user.id !== "833349943539531806") return
    
    const date1 = new Date() // Ficará esperando até quinta feira aos 12:00 para executar a rotina
    const dias = [4, 3, 2, 1, 7, 6, 5]
    const data_alvo = (dias[date1.getDay()] * 86400000) - ((36 - date1.getHours()) *3600000) + ((60 - date1.getMinutes()) *60000) + ((60 - date1.getSeconds()) *1000)

    const tempo_restante = (new Date(date1.getTime() + data_alvo)) - date1.getTime()
    
    next_att(client, tempo_restante)

    setTimeout(() => {
        gera_anuncio(client, 604800000)
        requisita_anuncio(client, 604800000) // Altera o valor para sempre executar à meia-noite
    }, tempo_restante) // Executa de 1 em 1 semana
}

function requisita_anuncio(client, aguardar_tempo) {
    setTimeout(() => {
        gera_anuncio(client, aguardar_tempo)
        requisita_anuncio(client, aguardar_tempo)
    }, aguardar_tempo)
}

async function gera_anuncio(client, proxima_att) {

    client.channels.cache.get('872865396200452127').send(`:video_game: | Disparando automaticamente anúncios de jogos gratuitos`)

    // fetch('https://apisal.herokuapp.com/games?reload=1') // Forçando o update da API
    // .then(response => response.json())
    // .then(async objeto_anunciado => {
        // dispara_anuncio({client, objeto_anunciado})
    // })

    next_att(client, proxima_att)
}

function next_att(client, tempo_restante) {

    tempo_restante = Math.floor((Date.now() / 1000) + (tempo_restante / 1000))

    client.channels.cache.get('872865396200452127').send(`:video_game: | Próxima atualização de jogos gratuitos em\n[ <t:${tempo_restante}:F> ]`)
}