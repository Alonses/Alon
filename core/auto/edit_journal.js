module.exports = async ({ client, caso, quantia }) => {

    if (!client.x.relatorio) return

    const bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })

    // Movimentações de bufunfas
    /* old db
    if (caso === "gerado" || caso === "movido" || caso === "reback") {
        bot.bfu[caso] += quantia

        if (caso === "gerado") // Salvando as Bufunfas geradas no histórico global
            bot.persis.bufunfas += quantia
    } else {

        if (caso === "messages") {
            bot.exp.exp_concedido += bot.persis.ranking
            bot.exp.msgs_validas += 1
            bot.exp.msgs_lidas += 1
        }

        if (caso === "comando") {
            bot.exp.exp_concedido += bot.persis.ranking * 1.5
            bot.cmd.ativacoes += 1
        }

        if (caso === "botao") {
            bot.exp.exp_concedido += bot.persis.ranking * 0.5
            bot.cmd.botoes += 1
        }

        if (caso === "menu") {
            bot.exp.exp_concedido += bot.persis.ranking * 0.5
            bot.cmd.menus += 1
        }

        if (caso === "msg_enviada")
            bot.exp.msgs_lidas += 1

        if (caso === "epic_embed")
            bot.cmd.erros += 1
    }

    await bot.save()
    */

    if (caso === "gerado") bot.bfu_gerado += 0;
    else if (caso === "movido") bot.bfu_movido += 0;
    else if (caso === "reback") bot.bfu_reback += 0;
    else if (caso === "comando") {
        bot.exp_concedido += bot.persis_ranking * 1.5
        bot.cmd_ativacoes++;
    }
    else if (caso === "messages") {
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

        await client.prisma.bot.update({
        where: { id: client.id() },
        data: bot
    })
}