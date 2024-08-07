const { dropReport, checkUserGuildReported } = require('../../../database/schemas/User_reports')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancelar
    // 1 -> Confirma remoção

    // 2 -> Menu para confirmar a escolha de remoção
    // 3 -> Menu para escolher o usuário

    const id_alvo = dados.split(".")[2]
    const id_guild = dados.split(".")[3]

    if (operacao === 0) { // Operação cancelada ( retorna ao embed do usuário )
        dados = `${id_alvo}.${id_guild}.${pagina}`
        return require('../../chunks/verify_report')({ client, user, interaction, dados })
    }

    if (operacao === 1) {

        // Removendo o reporte do usuário no servidor
        await dropReport(client, id_alvo, id_guild)

        // Verificando se há outros usuários reportados no servidor para poder continuar editando
        let reportes_server = await checkUserGuildReported(client, id_guild), row

        const obj = {
            content: client.tls.phrase(user, "mode.report.usuario_removido", 10),
            embeds: [],
            components: [],
            ephemeral: true
        }

        if (reportes_server.length > 0) {
            row = client.create_buttons([
                { id: "return_button", name: client.tls.phrase(user, "menu.botoes.ver_usuarios"), type: 0, emoji: client.emoji(19), data: "remove_report" }
            ], interaction)

            obj.components.push(row)
        }

        return interaction.update(obj)
    }

    if (operacao === 2) {

        // Criando os botões para o menu de remoção de reportes do servidor
        const row = client.create_buttons([
            { id: "report_remove_user", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}.${interaction.guild.id}` },
            { id: "report_remove_user", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${id_alvo}.${interaction.guild.id}` }
        ], interaction)

        // Listando os botões para confirmar e cancelar a operação
        return interaction.update({
            components: [row]
        })
    }

    if (operacao === 3) // Redirecionando o evento
        await require('./report_browse_user')({client, user, interaction, pagina})
}