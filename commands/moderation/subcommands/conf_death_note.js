const { PermissionsBitField, ChannelType } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    const death_note = await client.getGuild(interaction.guild.id, { death_note: true }).death_note

    let canal_alvo

    // Canal alvo para o bot enviar os logs de eventos
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildText)
            return client.tls.reply(interaction, user, "mode.report.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo o canal passado para o logger
        canal_alvo = interaction.options.getChannel("value")
        death_note.channel = canal_alvo.id
    }

    // Sem canal informado no comando e nenhum canal salvo no cache do bot
    if (!canal_alvo && !death_note.channel)
        return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)
    else {
        if (!death_note.channel) // Sem canal salvo em cache
            return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)

        if (typeof canal_alvo !== "object") // Restaurando o canal do cache
            canal_alvo = await client.channels().get(death_note.channel)

        if (!canal_alvo) { // Canal salvo em cache foi apagado
            death_note.note = false
            await client.prisma.guildOptionsDeathNote.update({
                where: { id: death_note.id },
                data: death_note
            })

            return client.tls.reply(interaction, user, "mode.logger.canal_excluido", true, 1)
        }

        // Sem permissão para ver ou escrever no canal mencionado
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
            return client.tls.reply(interaction, user, "mode.logger.falta_escrita_visualizacao", true, 1)
    }

    // Ativa ou desativa o logger no servidor
    if (!death_note.note) death_note.note = true
    else {
        // Inverte o status de funcionamento apenas se executar o comando sem informar um canal
        death_note.note = interaction.options.getChannel("value") ? true : !death_note.note
    }

    // Se usado sem mencionar um canal, desliga o logger
    if (!canal_alvo) death_note.note = false

    // Verificando as permissões do bot
    if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ViewAuditLog])) {
        death_note.note = false
        await client.prisma.guildOptionsDeathNote.update({
            where: { id: death_note.id },
            data: death_note
        })

        return client.reply(interaction, {
            content: client.tls.phrase(user, "manu.painel.salvo_sem_permissao", [10, 7]),
            ephemeral: true
        })
    }

    await client.prisma.guildOptionsDeathNote.update({
        where: { id: death_note.id },
        data: death_note
    })

    if (death_note.note)
        client.tls.reply(interaction, user, "mode.death_note.ativado", true, client.defaultEmoji("guard"), `<#${death_note.channel}>`)
    else
        client.tls.reply(interaction, user, "mode.death_note.desativado", true, 11)
}