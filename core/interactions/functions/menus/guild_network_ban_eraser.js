const { getNetworkedGuilds, updateGuild } = require('../../../database/schemas/Guild')

module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const network_guilds = await getNetworkedGuilds(client, guild.network_link)

    // Sincronizando os servidores com o novo tempo de exclusão para banimentos
    for (let i = 0; i < network_guilds.length; i++) {
        const update = {}
        update.network_erase_ban_messages = parseInt(dados)
        await updateGuild(client, network_guilds[i].id, update)
    }

    const pagina_guia = 1 // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction, pagina_guia })
}