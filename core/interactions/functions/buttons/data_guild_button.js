const { defaultEraser } = require('../../../formatters/patterns/timeout')


module.exports = async ({ client, user, interaction, dados }) => {

    const operacao = parseInt(dados.split(".")[1]) || dados
    let pagina_guia = 0, reback = "panel_guild_data"

    // Códigos de operação
    // 0 -> Redireciona para o painel de dados do servidor

    if (operacao === 1) pagina_guia = 1

    if (operacao === 2) {

        // Submenu para escolher o escopo do tempo de exclusão dos dados do servidor
        const valores = []
        const guild = await client.getGuild(interaction.guild.id)

        Object.keys(defaultEraser).forEach(key => { if (parseInt(key) !== guild.erase_timeout) valores.push(`${key}.${defaultEraser[key]}`) })

        // Definindo o tempo mínimo que um usuário deverá ficar mutado no servidor
        const data = {
            title: { tls: "menu.menus.escolher_expiracao" },
            pattern: "numbers",
            alvo: "data_guild_timeout",
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

    // Redirecionando o evento
    require('../../chunks/panel_guild_data')({ client, user, interaction, pagina_guia })
}