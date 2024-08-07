const { listAllUserTasks } = require('../../database/schemas/User_tasks')

module.exports = async ({ client, user, interaction, autor_original }) => {

    // Verificando se o usuário desabilitou as tasks globais
    const tarefas = await (user?.conf.global_tasks ? listAllUserTasks(client, interaction.user.id) : listAllUserTasks(client, interaction.user.id, interaction.guild.id))

    if (tarefas.length < 1) // Sem tarefas
        return client.tls.reply(interaction, user, "util.tarefas.sem_lista_r", true, client.emoji(0))

    const data = {
        title: { tls: "util.tarefas.escolher_tarefa_apagar" },
        pattern: "tasks_remove",
        alvo: "tarefas_remover",
        values: tarefas
    }

    const obj = {
        content: client.tls.phrase(user, "util.tarefas.selecionar_remover", 1),
        embeds: [],
        components: [client.create_menus({ client, interaction, user, data })],
        ephemeral: autor_original ? client.decider(user?.conf.ghost_mode, 0) : true
    }

    if (!autor_original) interaction.customId = null

    client.reply(interaction, obj)
}