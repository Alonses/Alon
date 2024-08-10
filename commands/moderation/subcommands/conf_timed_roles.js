const { PermissionsBitField, ChannelType } = require('discord.js')
const { updateGuild } = require("../../../core/database/schemas/Guild")

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    const guild = await client.getGuild(interaction.guild.id)
    let canal_alvo

    // Categoria alvo para o bot criar os canais
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildText)
            return client.tls.reply(interaction, user, "mode.anuncio.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo a categoria passada para os tickets
        canal_alvo = interaction.options.getChannel("value")
    }

    // Sem categoria informada no comando e nenhuma categoria salva no cache do bot
    if (!canal_alvo && !guild.timed_roles_channel)
        return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)
    else {

        // Sem permissão para ver ou escrever no canal mencionado
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
            return client.tls.reply(interaction, user, "mode.logger.falta_escrita_visualizacao", true, 1)

        await updateGuild(client, guild.id, { timed_roles_channel: canal_alvo.id })

        interaction.reply({
            content: `:passport_control: :white_check_mark: | O canal para os avisos dos \`⌚ Cargos temporários\` foi alterado com sucesso!\nNovos cargos que forem concedidos serão notificados em ${canal_alvo}`,
            ephemeral: true
        })
    }
}