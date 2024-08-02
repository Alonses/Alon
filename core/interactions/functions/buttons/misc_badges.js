const { createBadge } = require('../../../database/schemas/User_badges')
const { busca_badges } = require('../../../data/user_badges')
const { badgeTypes } = require('../../../formatters/patterns/user')

module.exports = async ({ client, user, interaction, dados }) => {

    // Atribuindo badges a usuários
    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirmar e notificar
    // 2 -> Confirmar silenciosamente

    // Cancelando a atribuição da badge
    if (!operacao)
        return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)

    const id_alvo = interaction.customId.split("|")[2].split(".")[0]
    const badge_alvo = parseInt(interaction.customId.split("|")[2].split(".")[1])

    // Atribuindo a badge ao usuário
    await createBadge(id_alvo, badge_alvo, client.timestamp())
    const badge = busca_badges(client, badgeTypes.SINGLE, badge_alvo)

    client.discord.users.fetch(id_alvo, false).then(async (user_interno) => {
        const alvo = await client.getUser(id_alvo)

        // Atribuindo e notificando
        if (operacao === 1) {
            client.sendDM(alvo.id, { content: client.tls.phrase(alvo, "dive.badges.new_badge", client.emoji("emojis_dancantes"), [badge.name, badge.emoji]) })

            interaction.update({
                content: `${client.emoji("emojis_dancantes")} | Badge \`${badge.name}\` ${badge.emoji} atribuída ao usuário ${user_interno}!`,
                embeds: [],
                components: [],
                ephemeral: true
            })
        } else // Atribuindo silenciosamente
            interaction.update({
                content: `${client.emoji("emojis_dancantes")} | Badge \`${badge.name}\` ${badge.emoji} atribuída silenciosamente ao usuário ${user_interno}!`,
                embeds: [],
                components: [],
                ephemeral: true
            })
    })
}