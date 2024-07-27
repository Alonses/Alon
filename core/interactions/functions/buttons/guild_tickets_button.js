const { ChannelType, PermissionsBitField } = require('discord.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_tickets"
    const guild = await client.getGuild(interaction.guild.id)

    // Sem categoria definida, solicitando uma categoria
    if (!guild.tickets_category) {
        reback = "panel_guild.2"
        operacao = 2
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 1 -> Ativar ou desativar o módulo denuncias in-server
    // 2 -> Escolher categoria para os tickets de denúncia

    if (operacao === 1) {

        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles]))
            return client.reply(interaction, {
                content: client.tls.phrase(user, "manu.painel.sem_permissoes", 7),
                ephemeral: true
            })

        // Ativa ou desativa a função de denúncias in-server
        guild.conf.tickets = !guild.conf.tickets
        await updateGuild(client, guild.id, { conf_tickets: !guild.conf_tickets })
    } else if (operacao === 2) {

        // Definindo a categoria do sistema de denúncias in-server
        const data = {
            title: { tls: "menu.menus.escolher_categoria" },
            pattern: "choose_channel",
            alvo: "guild_tickets#category",
            reback: "browse_button.guild_tickets_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, user, ChannelType.GuildCategory, guild.tickets_category)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "guild_tickets_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "2" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    }

    // Redirecionando a função para o painel de denúncias in-server
    require('../../chunks/panel_guild_tickets')({ client, user, interaction, operacao })
}