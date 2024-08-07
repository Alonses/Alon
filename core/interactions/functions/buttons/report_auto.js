const { PermissionsBitField } = require('discord.js')

const { getReport, updateUserReport} = require('../../../database/schemas/User_reports')
const { badges } = require('../../../formatters/patterns/user')

module.exports = async ({ client, user, interaction, dados }) => {

    // Gerenciamento de reportes de usuários
    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirma

    if (!operacao)
        return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)

    // Verificando as permissões para ver membros banidos do servidor
    if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.BanMembers]))
        return interaction.update({
            content: client.tls.phrase(user, "mode.report.sem_permissao_migrate", 7),
            ephemeral: true
        })

    await interaction.deferUpdate({ ephemeral: true })

    // Reportando os usuários banidos do servidor de forma automática
    let list = [], adicionados = 0

    // Verificando se o usuário possui a badge de reporter e concedendo caso não possua
    client.registryBadge(user, badges.REPORTER)

    // Coletando os usuários que foram banidos no servidor
    interaction.guild.bans.fetch()
        .then(async bans => {
            list = bans.map(user => user)

            for (let i = 0; i < list.length; i++)
                if (list[i].reason) {
                    const alvo = await getReport(client, list[i].user.id, interaction.guild.id);

                    await updateUserReport(client, alvo, {
                        relatory: list[i].reason,
                        nick: list[i].user.username,
                        timestamp: client.timestamp(),
                        issuer: interaction.user.id,
                        auto: true
                    })

                    adicionados++
                }

            let msg_feed = client.tls.phrase(user, "mode.report.usuarios_reportados", client.defaultEmoji("guard"), adicionados)

            if (adicionados === 1)
                msg_feed = client.tls.phrase(user, "mode.report.usuario_reportado", client.defaultEmoji("guard"))

            if (adicionados < 1)
                msg_feed = client.tls.phrase(user, "mode.report.sem_usuarios", client.defaultEmoji("guard"))

            return interaction.editReply({
                content: msg_feed,
                embeds: [],
                components: [],
                ephemeral: true
            })
        })
}