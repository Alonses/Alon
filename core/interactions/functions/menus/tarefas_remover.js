const { EmbedBuilder } = require('discord.js')

const { getTask, updateUserTask} = require('../../../database/schemas/User_tasks')
const { getUserGroup } = require('../../../database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    // Exibindo os dados de alguma tarefa selecionada
    let nome_lista = client.tls.phrase(user, "util.tarefas.sem_lista_v")

    if (!autor_original) // Redirecionando o usuário secundário
        return require("../../chunks/tarefas_remover")({ client, user, interaction })

    const task = await getTask(client, interaction.user.id, parseInt(dados.split(".")[1]))
    const lista = await getUserGroup(client, interaction.user.id, task.g_timestamp)

    // Botão para retornar até as listas do usuário
    let row_2 = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_navegar" }
    ], interaction)

    if (lista)
        nome_lista = lista.name
    else
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.lista_inexistente", 1),
            embeds: [],
            components: [row_2],
            ephemeral: true
        })

    // Atualiza os dados das tarefas e listas
    await updateUserTask(client, task.id, { guild_id: interaction.guild.id })

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "util.tarefas.sua_tarefa"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`\`\`\`${client.defaultEmoji("paper")} | ${task.text}\`\`\``)
        .addFields(
            {
                name: `${client.defaultEmoji("paper")} **${client.tls.phrase(user, "util.tarefas.lista")}**`,
                value: `\`${nome_lista}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(user, "util.server.criacao")}**`,
                value: `<t:${task.timestamp}:f>`,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "util.tarefas.selecionar_botoes"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    // Criando os botões para as funções de gestão de tarefas
    let row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "tarefas_remover" },
        { id: "tasks_delete_task", name: client.tls.phrase(user, "menu.botoes.apagar"), type: 3, emoji: client.emoji(13), data: `1|${task.timestamp}` },
        { id: "tasks_delete_task", name: client.tls.phrase(user, "menu.botoes.cancelar"), emoji: client.emoji(0), type: 1, data: 0 }
    ], interaction)

    interaction.update({
        content: "",
        embeds: [embed],
        components: [row],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}