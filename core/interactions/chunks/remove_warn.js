const { EmbedBuilder } = require("discord.js")

const { getUserWarn } = require("../../database/schemas/User_warns")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const timestamp = dados.split(".")[1]
    const pagina = dados.split(".")[2]

    let alvo = await getUserWarn(client, id_alvo, interaction.guild.id, timestamp)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.warn.remover_advertencia"))
        .setColor(0xED4245)
        .setDescription(client.tls.phrase(user, "mode.report.remover_reporte_desc", null, alvo.relatory))
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.user_id}\`\n( <@${alvo.user_id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportador")}**`,
                value: `${client.emoji("icon_id")} \`${alvo.assigner}\`\n( <@${alvo.assigner}> )`,
                inline: true
            },
            { name: "⠀", value: "⠀", inline: true }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de advertências
    const row = client.create_buttons([
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `remove_warn|${pagina}` },
        { id: "warn_remove_user", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}.${id_guild}` },
        { id: "warn_remove_user", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${id_alvo}.${id_guild}` }
    ], interaction)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}