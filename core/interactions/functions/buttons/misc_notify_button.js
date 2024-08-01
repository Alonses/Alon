const { free_games } = require('../../../functions/free_games.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, dados }) => {

    const operacao = parseInt(dados.split(".")[1])
    const idioma = dados.split(".")[3]

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirmar
    // 2 -> Confirmar e disparar anúncio

    if (operacao === 0)
        return interaction.update({
            content: client.tls.phrase(user, "menu.botoes.operacao_cancelada", client.emoji(0)),
            embeds: [],
            components: [],
            ephemeral: true
        })

    // Ativando o anúncio de games do servidor
    let guild = await client.getGuild(interaction.guild.id)

    await updateGuild(client, guild.id, {
        lang: idioma,
        games_enabled: true
    })

    client.notify(process.env.channel_feeds, { content: `:video_game: :mega: | O Servidor ( \`${interaction.guild.name}\` | \`${interaction.guild.id}\` ) agora recebe atts de jogos grátis` })

    interaction.update({
        content: client.tls.phrase(user, "mode.anuncio.anuncio_games", client.emoji(29), `<#${guild.games_channel}>`),
        embeds: [],
        components: [],
        ephemeral: true
    })

    if (operacao === 2) {
        const guild_channel = guild.games_channel
        free_games({ client, guild_channel })
    }
}