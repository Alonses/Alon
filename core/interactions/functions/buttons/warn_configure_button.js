const { getGuildWarn, updateGuildWarn} = require('../../../database/schemas/Guild_warns')
const {updateGuild} = require("../../../database/schemas/Guild");

const { spamTimeoutMap, defaultWarnStrikes, defaultRoleTimes } = require('../../../formatters/patterns/timeout')
const { guildActions, guildPermissions } = require('../../../formatters/patterns/guild')

// 10 -> Ativa ou desativa a hierarquia de advertências
// 11 -> Ativa ou deastiva a expiração de advertências

const operations = {
    10: { action: "warn.hierarchy.status", page: 0 },
    11: { action: "warn.timed", page: 0 }
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    const id_warn = parseInt(dados.split(".")[2])
    let operacao = parseInt(dados.split(".")[1]), reback = `warn_configure_button.${id_warn}`

    // Redirecionando para nova advertência
    if (operacao === 9) return require('../../chunks/warn_configure')({ client, user, interaction, dados })

    const warn = await getGuildWarn(client, interaction.guild.id, id_warn) // Cria uma nova advertência caso o ID passado não exista
    let guild = await client.getGuild(interaction.guild.id)

    // Tratamento dos cliques
    // 1 -> Escolher penalidade
    // 2 -> Escolher cargo
    // 3 -> Escolher tempo de mute
    // 4 -> Atualizar advertência
    // 5 -> Criar uma nova advertência

    // 20 -> Ativa ou desativa os cargos temporários na advertência
    // 21 -> Escolher o tempo de vinculo do cargo temporário

    // 9 -> Guia de customização das advertências

    if (operations[operacao]) ({ guild, pagina_guia } = client.switcher({ guild, operations, operacao }))
    else if (operacao === 1) {

        // Submenu para escoler a penalidade da advertência
        const eventos = []
        const guild_bot = await client.getMemberGuild(interaction.guild.id, client.id())

        if (warn.action) // Warn com penalidade definida
            eventos.push({ type: "none", status: false, id_alvo: id_warn })

        // Verificando se o bot possui as permissões para poder exibir no menu
        Object.keys(guildActions).forEach(evento => {
            if (evento !== warn.action && guild_bot.permissions.has(guildPermissions[evento])) {

                if (id_warn >= 1 || evento !== "member_kick_2" && evento !== "member_ban")
                    eventos.push({ type: evento, status: false, id_alvo: id_warn })
            }
        })

        // Definindo os eventos que o log irá relatar no servidor
        const data = {
            title: { tls: "menu.menus.escolher_acao" },
            pattern: "choose_action",
            alvo: "warn_config#action",
            reback: "browse_button.warn_configure_button",
            operation: operacao,
            values: eventos
        }

        const botoes = client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), botoes],
            ephemeral: true
        })

    } else if (operacao === 2) {

        // Submenu para escolher o cargo que será anexado com a advertência
        let cargos = []

        if (warn.role) // Opção de remover o cargo
            cargos.push({ name: client.tls.phrase(user, "menu.botoes.nenhum_cargo"), id: "none" })

        // Listando todos os cargos do servidor
        cargos = cargos.concat(await client.getGuildRoles(interaction, warn.role))

        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "warn_config#role",
            reback: "browse_button.warn_configure_button",
            operation: operacao,
            submenu: `x/${id_warn}`,
            values: cargos
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: `2.${id_warn}` }
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
        Object.keys(spamTimeoutMap).forEach(key => { if (parseInt(key) !== warn.timeout) valores.push(`${key}.${spamTimeoutMap[key]}`) })

        // Definindo o tempo mínimo que um usuário deverá ficar mutado no servidor
        const data = {
            title: { tls: "menu.menus.escolher_timeout" },
            pattern: "numbers",
            alvo: "warn_config_timeout",
            submenu: `${id_warn}.${operacao}`,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 12) {

        // Escolher o número de avisos prévios da advertência customizada
        const valores = []
        defaultWarnStrikes.forEach(key => { if (parseInt(key) !== warn.strikes) valores.push(key) })

        const data = {
            title: { tls: "menu.menus.escolher_numero" },
            pattern: "numbers",
            alvo: "warn_hierarchy_strikes",
            submenu: `${id_warn}.${operacao}`,
            raw: true,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 20) {
        // Inverte o status de ativação dos cargos temporários na advertência selecionada
        await updateGuildWarn(client, warn.id, { timed_role_status: !warn.timed_role_status })
    } else if (operacao === 21) {

        // Submenu para escolher o tempo de duração do cargo temporário da advertência
        const valores = []
        Object.keys(defaultRoleTimes).forEach(key => { if (parseInt(key) >= 5 && parseInt(key) !== warn.timed_role_timeout) valores.push(`${key}.${defaultRoleTimes[key]}`) })

        // Definindo o tempo que o cargo ficará com o membro que receber a advertência
        const data = {
            title: { tls: "menu.menus.escolher_tempo_remocao" },
            pattern: "numbers",
            alvo: "warn_config_role_timeout",
            submenu: `${id_warn}.${operacao}`,
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

    // Salvando os dados atualizados
    if (operations[operacao]) await updateGuild(client, guild.id, guild)

    require('../../chunks/warn_configure')({ client, user, interaction, dados })
}