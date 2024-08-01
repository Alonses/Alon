const { PermissionsBitField } = require('discord.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, dados }) => {

    const escolha = parseInt(dados.split(".")[1])
    const guild = await client.getGuild(interaction.guild.id)

    // Tratamento dos cliques
    // 2 -> Anúncio de Games ( Movido para guild_free_games_button )

    // 3 -> Denúncias in-server ( Movido para guild_tickets_button )
    // 4 -> Reportes de usuários mau comportados ( Movido para guild_reports_button )
    // 5 -> Logger do servidor ( Movido para guild_logger_button )

    // 6 -> Módulo anti-spam ( Movido para guild_anti_spam_button )
    // 8 -> AutoBan ( Movido para guild_reports_button )

    // 9 -> Convites Rastreados

    if (escolha === 9) {

        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageGuild]))
            return interaction.update({ content: client.tls.phrase(user, "mode.invites.sem_permissao", 7), ephemeral: true })

        // Ativa ou desativa os convites rastreados
        await updateGuild(client, guild.id, { nuke_invites: !guild.nuke_invites })
    }

    const pagina_guia = 2
    require('../../chunks/panel_guild')({ client, user, interaction, pagina_guia })
}