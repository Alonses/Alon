const { PermissionsBitField } = require('discord.js')

const { getReport, dropReport, updateUserReport} = require('../../../database/schemas/User_reports')
const { badges } = require('../../../formatters/patterns/user')

module.exports = async ({ client, user, interaction, dados }) => {

    // Gerenciamento de anotações
    const operacao = parseInt(dados.split(".")[1])
    const id_alvo = dados.split(".")[2]

    const alvo = await getReport(client, id_alvo, interaction.guild.id)
    const guild = await client.getGuild(interaction.guild.id, {
        network: true,
        reports: true
    })

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirma e notifica
    // 2 -> Confirma silenciosamente

    if (!operacao) { // Cancelando a criação do reporte
        await dropReport(client, alvo.user_id, interaction.guild.id)
        return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)
    }

    let texto_retorno = ""

    // Reportando um usuário mau comportado
    if (operacao === 1) {

        // Adicionando e reportando para outros servidores
        await updateUserReport(client, alvo, { archived: false })

        texto_retorno = client.tls.phrase(user, "mode.report.usuario_add", client.defaultEmoji("guard"))
        await require('../../../auto/send_report')({client, alvo})
    }

    if (operacao === 2) {

        // Adicionando sem anunciar para outros servidores
        await updateUserReport(client, alvo, { archived: false })

        texto_retorno = client.tls.phrase(user, "mode.report.adicionado_silenciosamente", client.defaultEmoji("guard"))
    }

    if (operacao === 3) {

        // Adicionando e reportando para outros servidores que fazem parte do network
        await updateUserReport(client, alvo, { archived: false })

        const link = guild.network.link
        texto_retorno = client.tls.phrase(user, "mode.report.anuncio_network", client.defaultEmoji("guard"))
        await require('../../../auto/send_report')({client, alvo, link})
    }

    // Verificando se o usuário possui a badge de reporter e concedendo caso não possua
    client.registryBadge(user, badges.REPORTER)

    // Verificando se a opção de banir o usuário ao fazer um report está ativa
    if (guild?.reports.auto_ban) {

        const bot_member = await client.getMemberGuild(interaction, client.id())

        // Permissões para banir outros membros
        if (!bot_member.permissions.has(PermissionsBitField.Flags.BanMembers))
            texto_retorno += `\n${client.tls.phrase(user, "mode.report.auto_ban_permissao", 7)}`

        const guild_member = await client.getMemberGuild(interaction, alvo.user_id)

        if (!guild_member) texto_retorno += `\n${client.tls.phrase(user, "mode.report.auto_ban_nao_encontrado", client.defaultEmoji("guard"))}`
        else {
            // Verificando se a hierarquia do membro que ativou o report é maior que o do alvo
            if (interaction.member.roles.highest.position < guild_member.roles.highest.position)
                texto_retorno += `\n${client.tls.phrase(user, "mode.report.auto_ban_hierarquia", 7)}`

            // Verificando se a hierarquia do bot é maior que o do alvo
            if (bot_member.roles.highest.position < guild_member.roles.highest.position)
                texto_retorno = `\n${client.tls.phrase(user, "mode.report.auto_ban_hierarquia_bot", 7)}`

            // Banindo o usuário do servidor automaticamente
            interaction.guild.members.ban(guild_member, {
                reason: alvo.relatory,
                deleteMessageSeconds: banMessageEraser[guild.reports.erase_ban_messages]
            }).catch(console.error)

            texto_retorno += `\n${client.tls.phrase(user, "mode.report.auto_ban_banido", client.emoji("banidos"))}`
        }
    }

    interaction.update({
        content: texto_retorno,
        embeds: [],
        components: [],
        ephemeral: true
    })
}