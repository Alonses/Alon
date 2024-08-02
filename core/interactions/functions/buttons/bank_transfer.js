module.exports = async ({ client, user, interaction, dados }) => {

    // Gerenciamento de transferência de Bufunfas entre usuários
    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirma

    if (!operacao)
        return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)

    // Transferindo Bufunfas entre usuários
    const id_alvo = dados.split(".")[2].split("[")[0]
    const alvo = await client.getUser(id_alvo)
    const bufunfas = parseFloat(dados.split("[")[1])

    await client.prisma.userOptionsMisc.update({
        where: { id: user.misc_id },
        data: { money: { increment: -bufunfas } }
    })

    await client.prisma.userOptionsMisc.update({
        where: { id: alvo.misc_id },
        data: { money: { increment: bufunfas } }
    })

    const user_i = await client.getCachedUser(alvo.id)

    // Registrando as movimentações de bufunfas para os usuários
    await client.registryStatement(user.uid, `misc.b_historico.deposito_enviado|${user_i.username}`, false, bufunfas)
    await client.registryStatement(alvo.uid, `misc.b_historico.deposito_recebido|${interaction.user.username}`, true, bufunfas)
    await client.journal("movido", bufunfas)

    interaction.update({
        content: client.tls.phrase(user, "misc.pay.sucesso", [9, 10], [client.locale(bufunfas), alvo.uid]),
        embeds: [],
        components: [],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })

    // Notificando o usuário que recebeu as Bufunfas
    client.sendDM(alvo.id, { content: client.tls.phrase(alvo, "misc.pay.notifica", client.emoji("emojis_dancantes"), [user.uid, client.locale(bufunfas)]) })
}