const { atualiza_modulos } = require('../../../auto/triggers/user_modules')
const { getModule, dropModule, updateModule} = require('../../../database/schemas/User_modules')
const { moduleDays } = require('../../../formatters/patterns/user')

module.exports = async ({ client, user, interaction, dados }) => {

    // Gerenciamento de anotações
    const operacao = parseInt(dados.split(".")[1])
    const timestamp = parseInt(dados.split(".")[2])
    dados = `0.${timestamp}`

    // Códigos de operação
    // 0 -> Sub menu para confirmar exclusão

    // 5 -> Confirma exclusão
    // 6 -> Cancela exclusão

    // 1 -> Ligar módulo
    // 2 -> Desligar módulo
    // 3 -> Alterar dia

    let row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "modulos" }
    ], interaction)

    const modulo = await getModule(client, interaction.user.id, timestamp)

    if (!modulo) // Verificando se o módulo ainda existe
        return interaction.update({
            content: client.tls.phrase(user, "misc.modulo.modulo_inexistente", 1),
            embeds: [],
            components: [row],
            ephemeral: true
        })

    if (operacao === 1) {
        // Ativando o módulo

        // Impedindo que o módulo de clima seja ativado caso não haja um local padrão
        if (modulo.type === 0 && !user.misc.locale)
            return interaction.update({
                content: client.tls.phrase(user, "util.tempo.modulo_sem_locale", client.emoji(0)),
                ephemeral: client.decider(user?.conf.ghost_mode, 0)
            })

        await updateModule(client, modulo.id, { active: true })

        await require('../../chunks/verify_module')({client, user, interaction, dados})
    }

    if (operacao === 2) {

        // Desativando o módulo
        await updateModule(client, modulo.id, { active: false })

        await require('../../chunks/verify_module')({client, user, interaction, dados})
    }

    if (operacao === 3) {

        const dias = []

        // Filtrando os dias que não estão selecionados
        Object.keys(moduleDays).forEach(dia => {
            if (parseInt(dia) !== modulo.days)
                dias.push(dia)
        })

        // Alterando o idioma do servidor
        const data = {
            title: { tls: "menu.menus.escolher_frequencia" },
            pattern: "modules_select_day",
            alvo: "modules_select_day",
            reback: "verify_module",
            timestamp: timestamp,
            values: dias
        }

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `verify_module.${timestamp}` }], interaction)],
            ephemeral: true
        })
    }

    if (operacao === 0) {

        const botoes = [
            { id: "module_button", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `5|${timestamp}` },
            { id: "module_button", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `6|${timestamp}` }
        ]

        return client.reply(interaction, {
            content: client.tls.phrase(user, "misc.modulo.confirmar_exclusao"),
            components: [client.create_buttons(botoes, interaction)]
        })
    }

    if (operacao === 5) {

        // Excluindo o módulo
        await dropModule(client, interaction.user.id, modulo.type, timestamp)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "misc.modulo.excluido", 13),
            embeds: [],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }

    if (operacao === 6) // Exclusão de módulo cancelada, redirecionando o evento
        return require('../../chunks/verify_module')({ client, user, interaction, dados })

    await atualiza_modulos(client) // Atualizando a lista de módulos salvos localmente
}