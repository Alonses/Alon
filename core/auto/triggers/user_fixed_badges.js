const { getUserWithFixedBadges } = require('../../database/schemas/User.js')

async function atualiza_fixed_badges(client) {

    const dados = await getUserWithFixedBadges(client)

    // Salvando as badges fixadas no cache do bot
    client.cached.fixed_badges = {}
    dados.forEach(badge => { client.cached.fixed_badges[badge.id] = [badge.misc.fixed_badge] })
}

module.exports.atualiza_fixed_badges = atualiza_fixed_badges