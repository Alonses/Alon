
async function getBot(client) {
    return client.prisma.bot.findUnique({ where: { id: client.id() } });
}

async function dailyReset(client) {

    // Reseta os dados diários do bot
    const bot = {
        cmd_ativacoes: 0,
        cmd_botoes: 0,
        cmd_menus: 0,
        cmd_erros: 0,

        exp_concedido: 0,
        msgs_validas: 0,
        msgs_lidas: 0,

        bfu_gerado: 0,
        bfu_movido: 0,
        bfu_reback: 0
    }

    await client.prisma.bot.update({ 
        where: { id: client.id() },
        data: bot
    })
}

async function updateBot(client, data) {
    await client.prisma.bot.update({
        where: { id: client.id() },
        data: data
    })
}

async function dropBot(client) {
    await client.prisma.bot.delete({ where: { id: client.id() } })
}

module.exports = {
    getBot,
    updateBot,
    dropBot,
    dailyReset
}