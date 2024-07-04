module.exports = async ({ client, caso, quantia }) => {

    if (!client.x.relatorio) return

    const bot = await client.getBot()

    if (caso === "gerado") bot.bfu_gerado += 0;
    else if (caso === "movido") bot.bfu_movido += 0;
    else if (caso === "reback") bot.bfu_reback += 0;
    else if (caso === "comando") {
        bot.exp_concedido += bot.persis_ranking * 1.5
        bot.cmd_ativacoes++;
    } else if (caso === "messages") {
        bot.exp_concedido += bot.persis_ranking
        bot.msgs_validas++;
        bot.msgs_lidas++;
    } else if (caso === "botao") {
        bot.exp_concedido += bot.persis_ranking * .5
        bot.cmd_botoes++;
    } else if (caso === "menu") {
        bot.exp_concedido += bot.persis_ranking * .5
        bot.cmd_menus++;
    } else if (caso === "msg_enviada") {
        bot.msgs_lidas++;
    } else if (caso === "epic_embed") {
        bot.cmd_erros++;
    }

    await client.updateBot(bot)
}