const { PermissionsBitField, ChannelType } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    const logger = await client.getGuild(interaction.guild.id, { logger: true }).logger
    let canal_alvo

    // Canal alvo para o bot enviar os logs de eventos
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildText)
            return client.tls.reply(interaction, user, "mode.report.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo o canal passado para o logger
        canal_alvo = interaction.options.getChannel("value")
        logger.channel = canal_alvo.id
    }

    // Sem canal informado no comando e nenhum canal salvo no cache do bot
    if (!canal_alvo && !logger.channel)
        return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)
    else {
        if (!logger.channel) // Sem canal salvo em cache
            return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)

        if (typeof canal_alvo !== "object") // Restaurando o canal do cache
            canal_alvo = await client.channels().get(logger.channel)

        if (!canal_alvo) { // Canal salvo em cache foi apagado
            logger.enabled = false
            await client.prisma.guildOptionsLogger.update({
                where: { id: logger.id },
                data: logger
            })

            return client.tls.reply(interaction, user, "mode.logger.canal_excluido", true, 1)
        }

        // Sem permissão para ver ou escrever no canal mencionado
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
            return client.tls.reply(interaction, user, "mode.logger.falta_escrita_visualizacao", true, 1)
    }

    // Ativa ou desativa o logger no servidor
    if (!logger.enabled) logger.enabled = true
    else {
        // Inverte o status de funcionamento apenas se executar o comando sem informar um canal
        logger.enabled = interaction.options.getChannel("value") ? true : !logger.enabled
    }

    // Se usado sem mencionar um canal, desliga o logger
    if (!canal_alvo) logger.enabled = false

    // Verificando as permissões do bot
    if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ViewAuditLog])) {
        logger.enabled = false
        await client.prisma.guildOptionsLogger.update({
            where: { id: logger.id },
            data: logger
        })

        return client.reply(interaction, {
            content: client.tls.phrase(user, "manu.painel.salvo_sem_permissao", [10, 7]),
            ephemeral: true
        })
    }

    await client.prisma.guildOptionsLogger.update({
        where: { id: logger.id },
        data: logger
    })

    if (logger.enabled)
        client.tls.reply(interaction, user, "mode.logger.ativado", true, client.defaultEmoji("guard"), `<#${logger.channel}>`)
    else
        client.tls.reply(interaction, user, "mode.logger.desativado", true, 11)
}