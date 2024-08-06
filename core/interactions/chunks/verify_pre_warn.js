const { EmbedBuilder } = require("discord.js")

const { listAllUserWarns } = require("../../database/schemas/User_warns")

const { listAllGuildWarns } = require("../../database/schemas/Guild_warns")
const { listAllUserPreWarns } = require("../../database/schemas/User_pre_warns")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const pagina = dados.split(".")[3]

    const user_warns = await listAllUserWarns(client, id_alvo, interaction.guild.id)
    const user_notes = await listAllUserPreWarns(client. id_alvo, interaction.guild.id)

    const guild = await client.getGuild(interaction.guild.id, { warn: true })
    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)

    let indice_matriz = client.verifyMatrixIndex(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

    // Verificando se existem advertências para as próximas punições do usuário
    let indice_warn = user_warns.length > guild_warns.length ? guild_warns.length - 1 : user_warns.length
    const notas_requeridas = guild_warns[indice_warn - 1].strikes || guild.warn.hierarchy_strikes

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.hierarquia.verificando_anotacao_titulo")} ${client.defaultEmoji("pen")}`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "mode.hierarquia.descricao_anotacao")}\n\`\`\`fix\n${client.tls.phrase(user, "mode.warn.ultima_descricao", 51)}\n\n${user_notes[user_notes.length - 1].relatory}\`\`\``)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${id_alvo}\`\n${client.emoji("mc_name_tag")} \`${user_warns[user_warns.length - 1].nick}\`\n( <@${id_alvo}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.hierarquia.criador_ultima_anotacao")}**`,
                value: `${client.emoji("icon_id")} \`${user_warns[user_warns.length - 1].assigner}\`\n${client.emoji("mc_name_tag")} \`${user_warns[user_warns.length - 1].assigner_nick}\`\n( <@${user_warns[user_warns.length - 1].assigner}> )`,
                inline: true
            },
            {
                name: `${client.emoji(47)} **${indice_warn} / ${indice_matriz} ${client.tls.phrase(user, "mode.warn.advertencias")}**`,
                value: `${client.defaultEmoji("pen")} **${user_notes.length} / ${notas_requeridas} ${client.tls.phrase(user, "menu.botoes.anotacoes")}**`,
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.emoji("banidos")} **${client.tls.phrase(user, "mode.hierarquia.proxima_warn")}**`,
                value: client.verifyAction(guild_warns[indice_warn - 1], user),
                inline: false
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de anotações
    let botoes = [
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `pre_warn_browse_user|${pagina}` },
        { id: "pre_warn_remove_user", name: client.tls.phrase(user, "menu.botoes.remover_anotacoes"), type: 1, emoji: client.emoji(42), data: `2|${id_alvo}.${interaction.guild.id}` },
        { id: "panel_guild_browse_pre_warns", name: client.tls.phrase(user, "menu.botoes.gerenciar_anotacoes"), type: 1, emoji: client.emoji(41), data: `11|${id_alvo}` }
    ]

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}