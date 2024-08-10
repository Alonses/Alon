const { PermissionsBitField, ChannelType } = require('discord.js')
const {updateGuild} = require("../../../core/database/schemas/Guild");

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    const guild = await client.getGuild(interaction.guild.id)
    let canal_alvo

    // Categoria alvo para o bot criar os canais
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildCategory)
            return client.tls.reply(interaction, user, "mode.ticket.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo a categoria passada para os tickets
        canal_alvo = interaction.options.getChannel("value")
        guild.tickets_category = canal_alvo.id
    }

    // Sem categoria informada no comando e nenhuma categoria salva no cache do bot
    if (!canal_alvo && !guild.tickets_category)
        return client.tls.reply(interaction, user, "mode.ticket.sem_categoria", true, 1)
    else {
        if (!guild.tickets.category) // Sem categoria salva em cache
            return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)

        if (typeof canal_alvo !== "object") // Restaurando a categoria do cache
            canal_alvo = await client.channels().get(guild.tickets_category)

        if (!canal_alvo) { // Categoria salva em cache foi apagada
            guild.tickets_enabled = false
            await updateGuild(client, guild.id, guild)

            return client.tls.reply(interaction, user, "mode.logger.categoria_excluida", true, 1)
        }
    }

    // Inverte o status de funcionamento apenas se executar o comando sem informar uma categoria
    guild.tickets_enabled = interaction.options.getChannel("value") ? true : !guild.tickets_enabled

    // Se usado sem mencionar categoria, desliga os tickets de denuncia
    if (!canal_alvo)
        guild.tickets_enabled = false

    // Verificando as permissões do bot
    if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles])) {
        guild.tickets_enabled = false
        await updateGuild(client, guild.id, guild)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "manu.painel.salvo_sem_permissao", [10, 7]),
            ephemeral: true
        })
    }

    await updateGuild(client, guild.id, guild)

    if (guild.tickets_enabled)
        client.tls.reply(interaction, user, "mode.ticket.ativo", true, 31)
    else
        client.tls.reply(interaction, user, "mode.ticket.desativo", true, 16)
}