const { getGames, verifyInvalidGames } = require('../database/schemas/Game')

const dispara_anuncio = require('../auto/send_announcement')

async function free_games({ client, guild_channel }) {

    // Verificando pelos games que já expiraram
    await verifyInvalidGames(client)

    const objetos_anunciados = await getGames(client)
    dispara_anuncio({ client, objetos_anunciados, guild_channel })
}

module.exports.free_games = free_games