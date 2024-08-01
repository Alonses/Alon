const { PermissionsBitField, ChannelType } = require('discord.js')
const {updateGuild} = require("../../../core/database/schemas/Guild");

module.exports = async ({ client, user, interaction }) => {
    const guild = await client.getGuild(interaction.guild.id, {
        logger: true,
        spam: true
    })
    let canal_alvo

    // Canal alvo para o bot enviar os relatórios de spam
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildText)
            return client.tls.reply(interaction, user, "mode.report.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo o canal passado para o antispam
        canal_alvo = interaction.options.getChannel("value")
        guild.logger.channel = canal_alvo.id
    }

    // Sem canal informado no comando e nenhum canal salvo no cache do bot
    if (!canal_alvo && !guild.logger.channel)
        return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)
    else {
        if (!guild.logger.channel) // Sem canal salvo em cache
            return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)

        if (typeof canal_alvo !== "object") // Restaurando o canal do cache
            canal_alvo = await client.channels().get(guild.logger.channel)

        if (!canal_alvo) { // Canal salvo em cache foi apagado
            guild.logger.enabled = false
            await client.prisma.guildOptionsLogger.update({
                where: { id: guild.logger_id },
                data: guild.logger
            })

            return client.tls.reply(interaction, user, "mode.logger.canal_excluido", true, 1)
        }

        // Sem permissão para ver ou escrever no canal mencionado
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
            return client.tls.reply(interaction, user, "mode.logger.falta_escrita_visualizacao", true, 1)
    }

    // Inverte o status de funcionamento apenas se executar o comando sem informar um canal
    guild.spam.enabled = interaction.options.getChannel("value") ? true : !guild.spam.enabled

    // Se usado sem mencionar categoria, desliga o sistema antispam
    if (!canal_alvo) guild.spam.enabled = false

    await client.prisma.guildOptionsSpam.update({
        where: { id: guild.spam_id },
        data: guild.spam
    })

    if (guild.spam.enabled)
        client.tls.reply(interaction, user, "mode.spam.ativado", true, client.defaultEmoji("guard"), [`<#${guild.logger.channel}>`, client.emoji("epic_embed_fail2")])
    else
        client.tls.reply(interaction, user, "mode.spam.desativado", true, client.defaultEmoji("guard"))
}