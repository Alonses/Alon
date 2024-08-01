const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id, { warn: true })
    const update = {}
    update.announce_channel = dados === "none" ? null : dados
    update.announce_status = guild.warn.announce_channel || !guild.warn.announce_status // Desativando o recurso de advertências públicas caso não haja um canal definido

    await client.prisma.guildOptionsWarn.update({
        where: { id: guild.warn_id },
        data: update
    })

    // Redirecionando o evento
    const pagina_guia = 1
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}