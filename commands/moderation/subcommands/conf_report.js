const { PermissionsBitField, ChannelType } = require('discord.js')
const {updateGuild} = require("../../../core/database/schemas/Guild");

module.exports = async ({ client, user, interaction }) => {
    const reports = await client.getGuild(interaction.guild.id, { reports: true }).reports
    let canal_alvo

    // Canal alvo para o bot enviar os relatórios de reportes
    if (interaction.options.getChannel("value")) {

        // Mencionado um tipo de canal errado
        if (interaction.options.getChannel("value").type !== ChannelType.GuildText)
            return client.tls.reply(interaction, user, "mode.report.tipo_canal", true, client.defaultEmoji("types"))

        // Atribuindo o canal passado para o reportador
        canal_alvo = interaction.options.getChannel("value")
        reports.channel = canal_alvo.id
    }

    // Sem canal informado no comando e nenhum canal salvo no cache do bot
    if (!canal_alvo && !reports.channel)
        return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)
    else {
        if (!reports.channel) // Sem canal salvo em cache
            return client.tls.reply(interaction, user, "mode.logger.mencao_canal", true, 1)

        if (typeof canal_alvo !== "object") // Restaurando o canal do cache
            canal_alvo = await client.channels().get(reports.channel)

        if (!canal_alvo) { // Canal salvo em cache foi apagado
            reports.enabled = false
            await client.prisma.guildOptionsReports.update({
                where: { id: reports.id },
                data: reports
            })

            return client.tls.reply(interaction, user, "mode.logger.canal_excluido", true, 1)
        }

        // Sem permissão para ver ou escrever no canal mencionado
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
            return client.tls.reply(interaction, user, "mode.logger.falta_escrita_visualizacao", true, 1)
    }

    // Inverte o status de funcionamento apenas se executar o comando sem informar um canal
    reports.enabled = interaction.options.getChannel("value") ? true : !reports.enabled

    // Se usado sem mencionar o canal, desliga os reportes no servidor
    if (!canal_alvo) reports.enabled = false

    await client.prisma.guildOptionsReports.update({
        where: { id: reports.id },
        data: reports
    })

    if (reports.enabled)
        client.tls.reply(interaction, user, "mode.report.ativo", true, 15, `<#${reports.channel}>`)
    else
        client.tls.reply(interaction, user, "mode.report.desativo", true, 16)
}