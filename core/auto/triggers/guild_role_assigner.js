const { getRoleAssigner } = require('../../database/schemas/Guild_role_assigner')

let membros_sv = [], operacao_ativa = false, segundo_plano = false
let updates = [0, 0, 0, 0, 0], emoji_dancante, cargos, repeticao, timestamp

module.exports = async ({ client, user, interaction, force_stop }) => {

    cargos = await getRoleAssigner(client, interaction.guild.id, "global")

    if (force_stop) {

        interaction.update({
            content: client.tls.phrase(user, "mode.roles.operacao_cancelada", 0, [updates[1], updates[2], updates[4], updates[3]]),
            components: []
        })

        updates = [0, 0, 0, 0, 0]
        membros_sv = []
        operacao_ativa = 0
        segundo_plano = false

        clearTimeout(repeticao)
        return
    }

    if (!operacao_ativa) {

        emoji_dancante = client.emoji("emojis_dancantes")

        const list = await client.guilds(interaction.guild.id)
        await list.members.fetch()
            .then(members => {
                membros_sv = members.map(member => member.id) // ID's dos membros do servidor
            })

        updates[0] = membros_sv.length

        await interaction.update({
            components: [client.create_buttons([{ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.interromper_operacao"), type: 3, emoji: client.emoji(13), data: "11" }], interaction)],
            ephemeral: true
        })

        timestamp = parseInt(client.timestamp() + (updates[0] * 1.5) + 1)
        alterar_users(client, user, interaction, 0)
    } else
        interaction.update({
            content: client.tls.phrase(user, "mode.roles.operacao_ativa", 4),
            ephemeral: true
        })
}

// updates[0] -> Quantidade de membros no servidor
// updates[1] -> Membros atualizados
// updates[2] -> Membros ignorados
// updates[3] -> Membros bots ignorados
// updates[4] -> Membros ignorados por cargos definidos

async function alterar_users(client, user, interaction, contador) {

    let member = await client.getMemberGuild(interaction.guild.id, membros_sv[0]) // Coleta

    if (!member.user.bot) { // Atualiza apenas usuários que não são bots

        let user_ignorado = false

        if (cargos.ignore) {
            const cargos_ignorados = cargos?.ignore.split(".")

            // Verificando se o usuário possui algum cargo listado para ignorar
            cargos_ignorados.forEach(cargo_ignorado => {
                if (member.roles.cache.has(cargo_ignorado))
                    user_ignorado = true

                if (cargo_ignorado === "all" && member.roles.cache.size > 1)
                    user_ignorado = true
            })
        }

        cargos.attribute.split(".").forEach(async cargo_interno => {

            if (!member.roles.cache.has(cargo_interno)) // Adicionando

                if (cargos.ignore) {
                    if (!user_ignorado) // Membro não possui um cargo ignorado
                        await member.roles.add(cargo_interno).then(updates[1]++).catch(console.error)
                    else updates[4]++
                } else // Adicionando
                    await member.roles.add(cargo_interno).then(updates[1]++).catch(console.error)
            else updates[2]++
        })
    } else updates[3]++

    contador++

    repeticao = setTimeout(() => {
        membros_sv.shift()

        if (membros_sv.length > 0) {
            if ((timestamp - client.timestamp()) < 600)
                interaction.editReply({ content: client.tls.phrase(user, "mode.roles.atualizando_usuarios", emoji_dancante, [contador, updates[0], timestamp]) })
            else if (!segundo_plano) {

                // Operação entrando em segundo plano, sem atualização de alterações
                segundo_plano = true
                interaction.editReply({ content: client.tls.phrase(user, "mode.roles.pin_segundo_plano", emoji_dancante, timestamp) })

                client.sendDM(user, { content: client.tls.phrase(user, "mode.roles.movido_segundo_plano", emoji_dancante, timestamp) })
            }

            alterar_users(client, user, interaction, contador)
        } else {
            operacao_ativa = 0

            if (!segundo_plano)
                interaction.editReply({
                    content: client.tls.phrase(user, "mode.roles.concluido", 59, [updates[1], updates[2], updates[4], updates[3]]),
                    components: []
                })

            segundo_plano = false
            client.sendDM(user, { content: client.tls.phrase(user, "mode.roles.concluido", 59, [updates[1], updates[2], updates[4], updates[3]]) })
        }
    }, 1500)
}