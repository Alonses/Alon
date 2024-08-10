const { createGroup, checkUserGroup } = require('../../../core/database/schemas/User_tasks_group')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    let check_list

    // Verificando se o usuário desabilitou as tasks globais
    if (client.decider(user?.conf.global_tasks, 1))
        check_list = await checkUserGroup(client, interaction.user.id, interaction.options.getString("description"))
    else
        check_list = await checkUserGroup(client, interaction.user.id, interaction.options.getString("description"), interaction.guild.id)

    if (check_list.length > 0) // Verificando se o nome da nova lista não existe ainda
        return client.tls.reply(interaction, user, "util.tarefas.lista_repetida", true, client.emoji(0))

    // Criando a lista
    await createGroup(client, interaction.user.id, interaction.options.getString("description"), interaction.guild.id, client.timestamp())

    client.tls.reply(interaction, user, "util.tarefas.lista_criada", client.decider(user?.conf.ghost_mode, 0), client.defaultEmoji("paper"))
}