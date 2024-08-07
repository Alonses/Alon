const { dropTask } = require('../../../database/schemas/User_tasks')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    const operacao = parseInt(dados.split(".")[1])

    if (!autor_original) // Redirecionando o usuário secundário
        return require('../../chunks/tarefas_remover')({ client, user, interaction, autor_original })

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirmar

    // Gerenciamento de tarefas
    if (!operacao) {

        let row = client.create_buttons([
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "tarefas_remover" }
        ], interaction)

        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.exclusao_tarefa_cancelada", client.defaultEmoji("paper")),
            embeds: [],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }

    // Apagando a tarefa
    const tarefa_timestamp = parseInt(dados.split(".")[2])

    await dropTask(client, interaction.user.id, tarefa_timestamp)

    // Botão para retornar até as listas do usuário
    let row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_navegar" }
    ], interaction)

    interaction.update({
        content: client.tls.phrase(user, "util.tarefas.exclusao_tarefa", 13),
        embeds: [],
        components: [row],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}