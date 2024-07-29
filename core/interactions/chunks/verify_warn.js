const { EmbedBuilder } = require("discord.js")

const { listAllUserWarns } = require("../../database/schemas/User_warns")
const { listAllGuildWarns } = require("../../database/schemas/Guild_warns")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const pagina = dados.split(".")[3]

    const user_warns = await listAllUserWarns(id_alvo, interaction.guild.id)
    const member_guild = await client.getMemberGuild(interaction, id_alvo)
    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)

    let indice_matriz = client.verifyMatrixIndex(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

    // Verificando se existem advertências para as próximas punições do usuário
    let indice_warn = user_warns.length > guild_warns.length ? guild_warns.length - 1 : user_warns.length

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.warn.verificando_advertencia")} :inbox_tray:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "mode.warn.advertencias_registradas")}\n\`\`\`fix\n${client.tls.phrase(user, "mode.warn.ultima_descricao", 51)}\n\n${user_warns[user_warns.length - 1].relatory}\`\`\``)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${id_alvo}\`\n${client.emoji("mc_name_tag")} \`${user_warns[user_warns.length - 1].nick}\`\n( <@${id_alvo}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(user, "util.user.entrada")}**`,
                value: member_guild ? `<t:${parseInt(member_guild.joinedTimestamp / 1000)}:F>` : `\`${client.tls.phrase(user, "mode.report.entrada_desconhecida")}\``,
                inline: true
            },
            {
                name: `${client.emoji(47)} **${client.tls.phrase(user, "mode.warn.advertencias")}**`,
                value: `\`${indice_warn} / ${indice_matriz}\``,
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.warn.aplicador_ultima_advertencia")}**`,
                value: `${client.emoji("icon_id")} \`${user_warns[user_warns.length - 1].assigner}\`\n${client.emoji("mc_name_tag")} \`${user_warns[user_warns.length - 1].assigner_nick}\`\n( <@${user_warns[user_warns.length - 1].assigner}> )`,
                inline: true
            },
            {
                name: `${client.emoji("banidos")} **${client.tls.phrase(user, "mode.warn.proxima_penalidade")}**`,
                value: client.verifyAction(guild_warns[indice_warn - 1], user),
                inline: true
            },
            { name: "⠀", value: "⠀", inline: true }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de advertência
    let botoes = [
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `warn_browse_user|${pagina}` },
        { id: "warn_remove_user", name: client.tls.phrase(user, "menu.botoes.remover_advertencias"), type: 1, emoji: client.emoji(42), data: `2|${id_alvo}.${interaction.guild.id}` },
        { id: "panel_guild_browse_warns", name: client.tls.phrase(user, "menu.botoes.gerenciar_advertencias"), type: 1, emoji: client.emoji(41), data: `0|${id_alvo}` }
    ]

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}