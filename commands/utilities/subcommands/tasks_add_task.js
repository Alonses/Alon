const { createTask, updateUserTask} = require('../../../core/database/schemas/User_tasks')
const { listAllUserGroups, updateUserTaskGroup} = require('../../../core/database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction }) => {

    // Criando uma nova tarefa
    let listas, timestamp = client.timestamp()

    // Verificando se o usuário desabilitou as tasks globais
    if (client.decider(user?.conf.global_tasks, 1))
        listas = await listAllUserGroups(client, interaction.user.id)
    else
        listas = await listAllUserGroups(client, interaction.user.id, interaction.guild.id)

    if (listas.length < 1)
        return client.tls.reply(interaction, user, "util.tarefas.sem_lista", true, client.emoji(0))

    const task = await createTask(client, interaction.user.id, interaction.guild.id, interaction.options.getString("description"), timestamp)

    // Adicionando a tarefa a uma lista automaticamente caso só exista uma lista
    if (listas.length === 1) {
        await updateUserTask(client, task.id, { g_timestamp: listas[0].timestamp })

        // Verificando se a lista não possui algum servidor mencionado
        if (!listas[0].server_id)
            await updateUserTaskGroup(client, listas[0], { guild_id: interaction.guild.id })

        return interaction.reply({
            content: `${client.tls.phrase(user, "util.tarefas.tarefa_adicionada", client.defaultEmoji("paper"))} \`${listas[0].name}\`!`,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    } else {

        // Exibindo todas as listas para o usuário vincular a tarefa a uma lista
        const data = {
            title: { tls: "util.tarefas.escolher_lista_vincular" },
            pattern: "lists",
            alvo: "listas",
            values: listas,
            timestamp: timestamp
        }

        interaction.reply({
            content: client.tls.phrase(user, "util.tarefas.tarefa_lista", 1),
            components: [client.create_menus({ client, interaction, user, data })],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}