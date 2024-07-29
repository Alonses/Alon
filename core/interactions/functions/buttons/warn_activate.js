const { listAllGuildWarns } = require("../../../database/schemas/Guild_warns")
const { listAllUserPreWarns } = require("../../../database/schemas/User_pre_warns")
const { listAllUserCachedHierarchyWarns, listAllUserWarns } = require("../../../database/schemas/User_warns")

const { guildPermissions } = require("../../../formatters/patterns/guild")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[2]
    let operacao = parseInt(dados.split(".")[1])
    const id_warn = parseInt(dados.split(".")[3])

    // Códigos de operação
    // 1 -> Menu para ativar a advertência
    // 2 -> Menu para cancelar a advertência

    // 4 -> Confirmar ativação
    // 5 -> Cancelar ativação

    // 7 -> Confirmar cancelamento
    // 8 -> Cancelar cancelamento

    // Verificando se o membro já ultrapassou o número de anotações necessárias para cada advertência 
    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)
    let user_warns = await listAllUserWarns(id_alvo, interaction.guild.id)

    let indice_warn = user_warns.length > guild_warns.length ? user_warns.length - 1 : user_warns.length
    if (indice_warn < 1) indice_warn = 0

    if (guild_warns[indice_warn].action !== "none") // Verificando permissões do membro que usou o comando para poder continuar
        if (!interaction.member.permissions.has(guildPermissions[guild_warns[indice_warn].action]))
            return interaction.reply({
                content: client.tls.phrase(user, "mode.anotacoes.permissao_moderador", 7),
                ephemeral: true
            })

    // Rascunhos de advertências salvas em cache
    user_warns = await listAllUserCachedHierarchyWarns(id_alvo, interaction.guild.id)

    if (user_warns.length < 1) return

    if (operacao === 7) {

        // Excluindo a advertência registrada em cache
        user_warns[user_warns.length - 1].delete()

        const user_notes = await listAllUserPreWarns(id_alvo, interaction.guild.id)
        user_notes.forEach(note => note.delete())

        return interaction.update({ content: client.tls.phrase(user, "mode.anotacoes.advertencia_cancelada", 13), components: [] })

    } else if (operacao === 1 || operacao === 2) {

        let alvo_confirma = 4, alvo_cancela = 5

        if (operacao === 2) {
            alvo_confirma = 7
            alvo_cancela = 8
        }

        const rows = [
            { id: "warn_activate", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `${alvo_confirma}|${id_alvo}.${id_warn}` },
            { id: "warn_activate", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `${alvo_cancela}|${id_alvo}.${id_warn}` }
        ]

        return interaction.update({
            components: [client.create_buttons(rows, interaction)]
        })

    } else if (operacao === 4) {

        // Aplicando a advertência
        const user_warn = user_warns[user_warns.length - 1]
        const user_notes = await listAllUserPreWarns(id_alvo, interaction.guild.id)

        let registro_notas = []

        user_notes.forEach(nota => {
            registro_notas.push(`${nota.assigner_nick} -> ${nota.relatory}\n${new Date(nota.timestamp * 1000).toLocaleString("pt-BR", { hour12: false })}`)

            // Removendo a anotação do membro
            nota.delete()
        })

        user_warn.valid = true
        user_warn.assigner = interaction.user.id
        user_warn.assigner_nick = interaction.user.username
        user_warn.timestamp = client.timestamp()
        user_warn.relatory = registro_notas.join("\n\n")

        await user_warn.save()

        const hierarquia = true
        const member_guild = await client.getMemberGuild(interaction, id_alvo)

        interaction.update({ content: client.tls.phrase(user, "mode.anotacoes.advertencia_aplicada", 10), components: [] })
        return require('../../../events/warn')({ client, interaction, user, member_guild, user_warn, hierarquia })

    } else if (operacao === 5 || operacao === 8) {

        // Botões de cancelamento para retorno aos botões principais
        const rows = [
            { id: "warn_activate", name: client.tls.phrase(user, "menu.botoes.conceder_advertencia"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}.${id_warn}` },
            { id: "warn_activate", name: client.tls.phrase(user, "menu.botoes.cancelar_advertencia"), type: 3, emoji: client.emoji(0), data: `2|${id_alvo}.${id_warn}` }
        ]

        return interaction.update({ components: [client.create_buttons(rows, interaction)] })
    }
}