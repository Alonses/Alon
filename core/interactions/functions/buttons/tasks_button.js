const { dropTask, getTask, updateUserTask} = require('../../../database/schemas/User_tasks')
const { listAllUserGroups } = require('../../../database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    if (!autor_original) // Redirecionando o usuário secundário
        return require('../../chunks/listas_navegar')({ client, user, interaction, autor_original })

    // Gerenciamento de anotações
    const operacao = parseInt(dados.split(".")[1])
    const timestamp = parseInt(dados.split(".")[2])

    // Códigos de operação
    // 0 -> Apagar
    // 1 -> Finalizar tarefa
    // 2 -> Alterar de lista
    // 3 -> Reabrir tarefa

    if (operacao === 2) {

        let listas

        // Verificando se o usuário desabilitou as tasks globais
        if (client.decider(user?.conf.global_tasks, 1))
            listas = await listAllUserGroups(client, interaction.user.id)
        else
            listas = await listAllUserGroups(client, interaction.user.id, interaction.guild.id)

        const data = {
            title: { tls: "util.tarefas.escolher_lista_navegar" },
            alvo: "listas",
            values: listas,
            timestamp: timestamp
        }

        let row = client.create_buttons([
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "a|tarefas" }
        ], interaction)

        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_lista", client.defaultEmoji("paper")),
            embeds: [],
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }

    // Botão para retornar até as listas do usuário
    let row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_navegar" }
    ], interaction)

    if (operacao === 0) {
        await dropTask(client, interaction.user.id, timestamp)

        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_excluida", 10),
            embeds: [],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }

    const task = await getTask(client, interaction.user.id, timestamp)
    const update = { }

    if (!task)
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_inexistente", 1),
            embeds: [],
            components: [row],
            ephemeral: true
        })

    // Verificando se a task não possui algum servidor mencionado
    if (!task.server_id)
        update.server_id = interaction.guild.id

    if (operacao === 1) {

        update.concluded = true
        await updateUserTask(client, task.id, update)

        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_movida_1", 10),
            embeds: [],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }

    if (operacao === 3) {

        update.concluded = false
        await updateUserTask(client, task.id, update)

        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_movida_2", 10),
            embeds: [],
            components: [row],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}