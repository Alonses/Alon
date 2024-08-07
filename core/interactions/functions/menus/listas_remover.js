const { listAllUserGroupTasks } = require('../../../database/schemas/User_tasks')
const { getUserGroup, updateUserTaskGroup} = require('../../../database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    if (!autor_original) // Redirecionando o usuário secundário
        return require("../../chunks/listas_remover")({ client, user, interaction })

    // Apagando uma lista especificada
    const lista_timestamp = dados.split(".")[1]
    const lista = await getUserGroup(client, interaction.user.id, parseInt(lista_timestamp))
    const tarefas = await listAllUserGroupTasks(interaction.user.id, lista_timestamp)

    // Botão para retornar até as listas do usuário
    let row_2 = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_navegar" }
    ], interaction)

    if (!lista)
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.lista_inexistente", 1),
            embeds: [],
            components: [row_2],
            ephemeral: true
        })

    // Atualiza os dados das tarefas e listas
    await updateUserTaskGroup(client, lista, { guild_id: interaction.guild.id })

    const row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_remover" },
        { id: "tasks_delete_list", name: client.tls.phrase(user, "menu.botoes.apagar"), type: 3, emoji: client.emoji(13), data: `1|${lista_timestamp}` },
        { id: "tasks_delete_list", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 1, emoji: client.emoji(0), data: 0 }
    ], interaction)

    interaction.update({
        content: client.tls.phrase(user, "util.tarefas.lista_confirmar_exclusao", 8, tarefas.length),
        components: [row],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}