const { dropTaskByGroup } = require('../../../database/schemas/User_tasks')
const { dropGroup } = require('../../../database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    const operacao = parseInt(dados.split(".")[1])

    if (!autor_original) { // Redirecionando o usuário secundário
        autor_original = false
        return require('../../chunks/listas_remover')({ client, user, interaction, autor_original })
    }

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirmar

    // Gerenciamento de listas de tarefas
    if (!operacao)
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.exclusao_lista_cancelada", client.defaultEmoji("paper")),
            embeds: [],
            components: [],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })

    // Apagando a lista especificada e as tarefas vinculadas a ela
    const lista_timestamp = parseInt(dados.split(".")[2])

    await dropTaskByGroup(client, interaction.user.id, lista_timestamp)
    await dropGroup(client, interaction.user.id, lista_timestamp)

    interaction.update({
        content: client.tls.phrase(user, "util.tarefas.exclusao_lista", 13),
        embeds: [],
        components: [],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}