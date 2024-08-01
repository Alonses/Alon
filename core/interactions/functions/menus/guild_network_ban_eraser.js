const { getNetworkedGuilds, updateGuild } = require('../../../database/schemas/Guild')

module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id, { network: true })
    const network_guilds = await getNetworkedGuilds(client, guild.network.link)

    // Sincronizando os servidores com o novo tempo de exclusão para banimentos
    for (let i = 0; i < network_guilds.length; i++)
        await client.prisma.guildOptionsNetwork.update({
            where: { id: network_guilds[i].network_id },
            data: { erase_ban_messages: parseInt(dados) }
        })

    const pagina_guia = 1 // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction, pagina_guia })
}