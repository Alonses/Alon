const { EmbedBuilder } = require('discord.js')

const { getTask, updateUserTask} = require('../../../database/schemas/User_tasks')
const { listAllUserGroups, getUserGroup } = require('../../../database/schemas/User_tasks_group')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    // Exibindo os dados de alguma tarefa selecionada
    let nome_lista = client.tls.phrase(user, "util.tarefas.sem_lista_v"), operador = dados.split(".")[2]

    if (!autor_original) { // O usuário que reagiu ao botão não é o autor original do comando
        let operador = `${dados.split(".")[2]}|tarefas`
        return require('../../chunks/tarefas')({ client, user, interaction, operador, autor_original })
    }

    const task = await getTask(client, interaction.user.id, parseInt(dados.split(".")[1]))

    // Botão para retornar até as listas do usuário
    let row_2 = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "listas_navegar" }
    ], interaction)

    if (!task)
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.tarefa_inexistente", 1),
            embeds: [],
            components: [row_2],
            ephemeral: true
        })

    const lista = await getUserGroup(client, interaction.user.id, task.g_timestamp)

    if (!lista)
        return interaction.update({
            content: client.tls.phrase(user, "util.tarefas.lista_inexistente", 1),
            embeds: [],
            components: [row_2],
            ephemeral: true
        })

    if (dados.includes("x"))
        operador = `x|${dados.split(".")[3]}`

    if (dados.includes("k"))
        operador = `k|${dados.split(".")[3]}`

    if (lista)
        nome_lista = lista.name

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
    let botoes = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${operador}|tarefas` }]
    const listas = await (user?.conf.global_tasks ? listAllUserGroups(client, interaction.user.id) : listAllUserGroups(client, interaction.user.id, interaction.guild.id))

    if (!task.concluded) // Tarefas em aberto
        botoes = botoes.concat([{ id: "tasks_button", name: client.tls.phrase(user, "menu.botoes.marcar_concluida"), type: 2, emoji: client.emoji("mc_approve"), data: `1|${task.timestamp}` }])
    else // Tarefas finalizadas
        botoes = botoes.concat([{ id: "tasks_button", name: client.tls.phrase(user, "menu.botoes.abrir_novamente"), type: 2, emoji: client.emoji(31), data: `3|${task.timestamp}` }])

    if (listas.length > 1) // Mais de uma lista criada
        botoes = botoes.concat([{ id: "tasks_button", name: client.tls.phrase(user, "menu.botoes.alterar_de_lista"), emoji: client.defaultEmoji("paper"), type: 1, data: `2|${task.timestamp}` }])

    botoes = botoes.concat([{ id: "tasks_button", name: client.tls.phrase(user, "menu.botoes.apagar"), type: 3, emoji: client.emoji(13), data: `0|${task.timestamp}` }])

    const obj = {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    }

    client.reply(interaction, obj)
}