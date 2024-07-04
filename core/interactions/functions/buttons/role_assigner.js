const { PermissionsBitField } = require('discord.js')

const { getRoleAssigner } = require('../../../database/schemas/Guild_role_assigner')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "role_assigner"
    const caso = dados.split(".")[2] || "global"

    // Operações
    // 0 -> Retorna ao original

    // 1 -> Iniciar atribuição
    // 2 -> Escolher cargos
    // 3 -> Escolher cargos ignorados

    // 4 -> Remover todos os cargos para atribuir
    // 5 -> Remover todos os cargos para ignorar

    // 10 -> Confirmar atribuição de cargos para o servidor
    // 20 -> Inverte o status para conceder ou não cargos ao entrar no servidor 

    const cargos = await getRoleAssigner(interaction.guild.id, caso)

    if (operacao === 1) {

        let botoes = [
            { id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.global` },
            { id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: "10.global" }
        ]

        return client.reply(interaction, {
            components: [client.create_buttons(botoes, interaction)]
        })

    } else if (operacao === 2) {

        // Permissão para atualizar os cargos de membros do servidor
        if (!await client.permissions(interaction, client.id(), PermissionsBitField.Flags.ManageRoles))
            return interaction.update({
                content: client.tls.phrase(user, "mode.anuncio.permissao_cargos", 7),
                ephemeral: true
            })

        // Definindo os cargos que serão inclusos
        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "role_assigner_give#role",
            reback: "browse_button.role_assigner",
            operation: operacao,
            submenu: caso,
            values: await client.getGuildRoles(interaction)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.${caso}` },
            { id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: `2.${caso}` }
        ]

        if (cargos.atribute)
            botoes.push({ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.remover_todos"), type: 3, emoji: client.emoji(13), data: `4.${caso}` })

        const multi_select = true
        let row = client.menu_navigation(user, data, pagina || 0)

        const obj = {
            components: [client.create_menus({ client, interaction, user, data, pagina, multi_select }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        }

        if (row.length > 0) // Botões de navegação
            obj.components = obj.components.concat(client.create_buttons(row, interaction))

        return interaction.update(obj)

    } else if (operacao === 3) {

        // Permissão para atualizar os cargos de membros do servidor
        if (!await client.permissions(interaction, client.id(), PermissionsBitField.Flags.ManageRoles))
            return interaction.update({
                content: client.tls.phrase(user, "mode.anuncio.permissao_cargos", 7),
                ephemeral: true
            })

        // Definindo os cargos de membros que serão ignorados
        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "role_assigner_ignore#role",
            reback: "browse_button.role_assigner",
            operation: operacao,
            submenu: "global",
            values: []
        }

        if (cargos.ignore && cargos?.ignore !== "all") // Opção coringa para ignorar membros que já possuírem algum cargo
            data.values.push({ name: client.tls.phrase(user, "mode.roles.se_possuir_cargo"), id: "all" })

        const cargos_server = await client.getGuildRoles(interaction)

        cargos_server.forEach(cargo => {
            if (cargos.atribute) {
                if (!cargos.atribute.includes(cargo.id)) data.values.push(cargo)
            } else data.values.push(cargo)
        })

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.global` },
            { id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "3.global" }
        ]

        if (cargos.ignore)
            botoes.push({ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.remover_todos"), type: 3, emoji: client.emoji(13), data: "5.global" })

        const multi_select = true
        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina, multi_select }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 20) { // Inverte o funcionamento do atribuidor de cargos ao entrar no servidor
        cargos.status = !cargos.status

        // Salvando a alteração no cache do bot
        client.cached.join_guilds.set(interaction.guild.id, true)
    }

    if (operacao === 10) // Atribuindo os cargos selecionados aos usuários do servidor
        return require('../../../auto/triggers/guild_role_assigner')({ client, user, interaction })

    if (operacao === 11) { // Interrompendo a atribuição de cargos aos usuários do servidor
        const force_stop = true
        return require('../../../auto/triggers/guild_role_assigner')({ client, user, interaction, force_stop })
    }

    // Removendo os cargos salvos em cache
    if (operacao === 4) cargos.atribute = null
    else if (operacao === 5) cargos.ignore = null

    // Desliga a atribuição de cargos em entradas caso seja removido os cargos selecionados
    if (!cargos.atribute && caso === "join") {
        cargos.status = false

        // Salvando a alteração no cache do bot
        client.cached.join_guilds.delete(interaction.guild.id)
    }

    await cargos.save()

    require('../../chunks/role_assigner')({ client, user, interaction, caso })
}