const { buildAllBadges, busca_badges } = require('../../data/user_badges')
const { getUserReports } = require('../../database/schemas/User_reports')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    // Códigos de operação
    // 0 -> Perfil
    // 1 -> Permissões
    // 2 -> Badges
    // 3 -> Histórico de reportes

    let id_alvo, operador = 0

    // Coletando os dados do usuário
    if (dados) {
        operador = parseInt(dados.split(".")[1])
        id_alvo = dados.split(".")[2]
    } else
        id_alvo = interaction.options.getUser("user")?.id || interaction.user.id

    const membro_sv = await client.getMemberGuild(interaction, id_alvo)

    if (!membro_sv) // Usuário fora do servidor (pode ser gerado por menus de contexto)
        return client.tls.reply(interaction, user, "mode.report.usuario_nao_encontrado", true, 1)

    const infos_user = await client.create_profile({ interaction, user, id_alvo, operador })

    if (!membro_sv) { // Usuário foi removido do cache do bot
        interaction.update({
            content: client.tls.phrase(user, "menu.botoes.comando_desatualizado"),
            components: []
        })
            .catch(err => { client.error(err, "User Info Model") })

        return
    }

    // Permissões e cargos
    if (operador === 1) {

        // Listando todas as permissões e cargos do usuário
        const cargos_user = membro_sv.roles.cache.map(r => `${r}`).join(" ").replace(" @everyone", "").slice(0, 2000)

        infos_user.addFields(
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "util.server.cargos")}**`,
                value: `${cargos_user}`,
                inline: false
            },
            {
                name: `:shield: **${client.tls.phrase(user, "menu.botoes.permissoes")}**`,
                value: client.list(membro_sv.permissions.toArray(), 2000),
                inline: false
            }
        )
    }

    // Badges do usuário
    if (operador === 2) {

        const internal_user = await client.getUser(id_alvo, {
            conf: true,
            misc: true
        })

        // Informando ao usuário do comando que essa guia está desativada para ele
        if (!autor_original && !internal_user?.conf.public_badges)
            return client.tls.reply(interaction, user, "manu.data.nao_compartilha_badges", true, 18)

        let id_badges = await client.getUserBadges(id_alvo)
        let badges = await buildAllBadges(client, user, id_badges)
        // let achievements = busca_achievements(client, all, user.id, interaction)

        if (internal_user.misc.fixed_badge) {
            const fixed_badge = busca_badges(client, 1, internal_user)

            infos_user.addFields({
                name: `:pushpin: **${client.tls.phrase(user, "manu.data.selects.uni.4")}**`,
                value: `${fixed_badge.emoji} \`${fixed_badge.name}\``,
                inline: false
            })
        }

        if (badges.length > 0)
            infos_user.addFields({
                name: ":trophy: **Badges**",
                value: badges,
                inline: false
            })
        else
            infos_user.setDescription(`\`\`\`🏆 | ${client.tls.phrase(user, "dive.badges.sem_badge")}\`\`\``)
    }

    // Reportes sobre o usuário
    if (operador === 3) {

        // Coletando os dados de histórico do usuário
        const reports = await getUserReports(id_alvo)
        let avisos_reportes = 0, descricao_reportes, historico = []

        // Quantificando os relatórios sobre o usuário
        reports.forEach(valor => {
            avisos_reportes++

            historico.push(`-> ${new Date(valor.timestamp * 1000).toLocaleString("pt-BR")} | ${valor.relatory}`)
        })

        if (avisos_reportes > 0)
            descricao_reportes = `\`\`\`${client.tls.phrase(user, "mode.report.com_report", 4)}\n\n${historico.join("\n").slice(0, 1000)}\`\`\``

        if (descricao_reportes)
            infos_user.setDescription(descricao_reportes)
                .addFields(
                    {
                        name: `:man_guard: **${client.tls.phrase(user, "mode.report.reporte")}: ${avisos_reportes}**`,
                        value: "⠀",
                        inline: true
                    }
                )
        else
            infos_user.setDescription(`\`\`\`✅ | ${client.tls.phrase(user, "mode.report.sem_report")}\`\`\``)
    }

    // Liga e desliga os botões conforme a página que o usuário se encontra
    const b_disabled = [false, false, false, false]
    const c_buttons = [1, 1, 1, 1]
    b_disabled[operador] = true
    c_buttons[operador] = 2

    // Desabilitando a guia de badges caso o usuário tenha escondido
    if (!autor_original) {
        const internal_user = await client.getUser(id_alvo, { conf: true })

        if (!internal_user?.conf.public_badges)
            b_disabled[2] = true
    }

    const row = client.create_buttons([
        { id: "user_info_button", name: client.tls.phrase(user, "menu.botoes.perfil"), type: c_buttons[0], emoji: '👤', data: `0|${id_alvo}`, disabled: b_disabled[0] },
        { id: "user_info_button", name: client.tls.phrase(user, "menu.botoes.permissoes"), type: c_buttons[1], emoji: '🏷️', data: `1|${id_alvo}`, disabled: b_disabled[1] },
        { id: "user_info_button", name: "Badges", type: c_buttons[2], emoji: '🏆', data: `2|${id_alvo}`, disabled: b_disabled[2] },
        { id: "user_info_button", name: client.tls.phrase(user, "menu.botoes.historico"), type: c_buttons[3], emoji: '📠', data: `3|${id_alvo}`, disabled: b_disabled[3] }
    ], interaction)

    const obj = {
        embeds: [infos_user],
        components: [row],
        ephemeral: autor_original ? client.decider(user?.conf.ghost_mode, 0) : true
    }

    if (!autor_original) interaction.customId = null

    client.reply(interaction, obj)
}