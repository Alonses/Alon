
const { getGuildStrike, updateGuildStrike} = require('../../../database/schemas/Guild_strikes')

const { spamTimeoutMap, defaultRoleTimes } = require('../../../formatters/patterns/timeout')
const { guildPermissions, guildActions } = require('../../../formatters/patterns/guild')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    const id_strike = parseInt(dados.split(".")[2])
    let operacao = parseInt(dados.split(".")[1]), reback = `strike_configure_button.${id_strike}`

    const strike = await getGuildStrike(client, interaction.guild.id, id_strike) // Cria um novo strike caso o ID passado não exista

    // Tratamento dos cliques
    // 1 -> Escolher penalidade
    // 2 -> Escolher cargo
    // 3 -> Escolher tempo de mute
    // 4 -> Atualizar strike
    // 5 -> Criar um novo strike

    // 20 -> Ativa ou desativa os cargos temporários no strike
    // 21 -> Escolher o tempo de vinculo do cargo temporário

    // 9 -> Guia de customização dos strikes

    if (operacao === 1) {

        // Submenu para escoler a penalidade do strike
        const eventos = []
        const guild_bot = await client.getMemberGuild(interaction.guild.id, client.id())

        if (strike.action) // Strike com penalidade definida
            eventos.push({ type: "none", status: false, id_alvo: id_strike })

        // Verificando se o bot possui as permissões para poder exibir no menu
        Object.keys(guildActions).forEach(evento => {
            if (evento !== strike.action && guild_bot.permissions.has(guildPermissions[evento]))
                eventos.push({ type: evento, status: false, id_alvo: id_strike })
        })

        // Definindo a penalidade que será aplicada ao Strike selecionado
        const data = {
            title: { tls: "menu.menus.escolher_acao" },
            pattern: "choose_action",
            alvo: "strike_config#action",
            reback: "browse_button.strike_configure_button",
            operation: operacao,
            values: eventos
        }

        const botoes = client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), botoes],
            ephemeral: true
        })

    } else if (operacao === 2) {

        // Submenu para escolher o cargo que será anexado com o strike
        let cargos = []

        if (strike.role) // Opção de remover o cargo
            cargos.push({ name: client.tls.phrase(user, "menu.botoes.nenhum_cargo"), id: "none" })

        // Listando todos os cargos do servidor
        cargos = cargos.concat(await client.getGuildRoles(interaction, strike.role))

        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "strike_config#role",
            reback: "browse_button.strike_configure_button",
            operation: operacao,
            submenu: `x/${id_strike}`,
            values: cargos
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "strike_configure_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: `2.${id_strike}` }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 3) {

        // Submenu para escolher o escopo do tempo a ser aplicado
        const valores = []

        Object.keys(spamTimeoutMap).forEach(key => { if (parseInt(key) !== strike.timeout) valores.push(`${key}.${spamTimeoutMap[key]}`) })

        // Definindo o tempo mínimo que um usuário deverá ficar mutado no servidor
        const data = {
            title: { tls: "menu.menus.escolher_timeout" },
            pattern: "numbers",
            alvo: "strike_config_timeout",
            submenu: `${id_strike}.${operacao}`,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 20) { // Inverte o status de ativação dos cargos temporários no strike selecionado
        await updateGuildStrike(client, strike.id, { timed_role_status: !strike.timed_role_status })
    } else if (operacao === 21) {

        // Submenu para escolher o tempo de duração do cargo temporário do strike
        const valores = []
        Object.keys(defaultRoleTimes).forEach(key => { if (parseInt(key) >= 5 && parseInt(key) !== strike.timed_role_timeout) valores.push(`${key}.${defaultRoleTimes[key]}`) })

        // Definindo o tempo que o cargo ficará com o membro que receber o strike
        const data = {
            title: { tls: "menu.menus.escolher_tempo_remocao" },
            pattern: "numbers",
            alvo: "strike_config_role_timeout",
            submenu: `${id_strike}.${operacao}`,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }

    require('../../chunks/strike_configure')({ client, user, interaction, dados })
}