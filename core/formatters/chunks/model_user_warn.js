const { EmbedBuilder } = require('discord.js')

const { getUserWarn, listAllUserWarns, updateWarn} = require('../../database/schemas/User_warns')
const { listAllGuildWarns } = require('../../database/schemas/Guild_warns')
const { getUserPreWarn, listAllUserPreWarns, updatePreWarn } = require('../../database/schemas/User_pre_warns')

const { spamTimeoutMap, defaultEraser } = require('../patterns/timeout')
const { default_emoji } = require('../../../files/json/text/emojis.json')

module.exports = async ({ client, user, interaction, guild, user_warns, guild_member }) => {

    const descricao_warn = interaction.options.getString("reason")
    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)

    let texto_rodape = "⠀", user_warn, id_warn = "warn_create"

    const warns_recebidos = await listAllUserWarns(client, guild_member.id, interaction.guild.id)
    const indice_warn = warns_recebidos.length >= guild_warns.length ? guild_warns.length - 1 : warns_recebidos.length

    const update = {
        valid: false,
        relatory: descricao_warn,
        nick: guild_member.user.username,
        assigner: interaction.user.id,
        assigner_nick: interaction.user.username,
        timestamp: client.timestamp()
    }

    if (!guild.warn.hierarchy.status) {
        if (user_warns.length < guild_warns.length) user_warn = await getUserWarn(client, guild_member.id, interaction.guild.id, client.timestamp())
        else user_warn = user_warns[user_warns.length - 1]
        await updateWarn(client, user_warn.id, update)
    } else {
        user_warn = await getUserPreWarn(client, guild_member.id, interaction.guild.id, client.timestamp())
        id_warn = "pre_warn_create"
        await updatePreWarn(client, user_warn.id, update)
    }

    const embed = new EmbedBuilder()
        .setTitle(`${!guild.warn.hierarchy.status ? client.tls.phrase(user, "mode.warn.criando_advertencia") : client.tls.phrase(user, "mode.anotacoes.nova_anotacao")} :inbox_tray:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(!guild.warn.hierarchy.status ? client.tls.phrase(user, "mode.warn.descricao_inclusao_warn", null, descricao_warn) : client.tls.phrase(user, "mode.anotacoes.descricao_nova_anotacao", null, [descricao_warn, client.emoji("banidos"), warns_recebidos.length + 1]))
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${guild_member.id}\`\n${client.emoji("mc_name_tag")} \`${update.nick}\`\n( <@${guild_member.id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportador")}**`,
                value: `${client.emoji("icon_id")} \`${interaction.user.id}\`\n${client.emoji("mc_name_tag")} \`${interaction.user.username}\`\n( <@${interaction.user.id}> )`,
                inline: true
            }
        )

    if (!guild.warn.hierarchy.status) {

        // Verificando se existem advertências para as próximas punições do usuário
        const indice_matriz = client.verifyMatrixIndex(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

        embed.addFields(
            {
                name: `${client.emoji(47)} **${client.tls.phrase(user, "mode.warn.advertencias_em_registro")}**`,
                value: `\`( ${user_warns.length} + 1 ) / ${indice_matriz}\``,
                inline: true
            },
            {
                name: `${client.emoji("banidos")} **${client.tls.phrase(user, "menu.botoes.penalidade")}**`,
                value: client.verifyAction(guild_warns[indice_warn], user),
                inline: true
            }
        )

    } else {

        // Coletando todas as anotações de advertência criadas para o membro no servidor
        const user_notes = await listAllUserPreWarns(client, guild_member.id, interaction.guild.id)
        const notas_requeridas = guild_warns[indice_warn].strikes !== 0 ? guild_warns[indice_warn].strikes : guild.warn.hierarchy.strikes

        embed.addFields(
            {
                name: `${client.defaultEmoji("pen")} **${user_notes.length > 0 ? `${user_notes.length} / ${notas_requeridas} ${client.tls.phrase(user, "menu.botoes.anotacoes")}` : client.tls.phrase(user, "mode.anotacoes.sem_anotacoes")}**`,
                value: user_notes.length < 1 ? `**${default_emoji["numbers"][notas_requeridas]} ${client.tls.phrase(user, "mode.anotacoes.anotacoes_requeridas")}**` : "⠀",
                inline: true
            },
            {
                name: `${warns_recebidos.length + 1}° ${client.tls.phrase(user, "mode.anotacoes.adv_concessao")}`,
                value: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.anotacoes.penalidades")}:**\n${client.verifyAction(guild_warns[indice_warn], user)}`,
                inline: false
            }
        )
    }

    // Advertência com prazo de expiração
    if (id_warn === "create_warn")
        if (guild.warn.timed) {
            embed.addFields({
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "menu.botoes.expiracao")}**`,
                value: `**${client.tls.phrase(user, "mode.warn.remocao_em")} \`${client.tls.phrase(user, `menu.times.${spamTimeoutMap[guild.warn.reset]}`)}\`**\n( <t:${client.timestamp() + spamTimeoutMap[guild.warn.reset]}:f> )`,
                inline: true
            })

            texto_rodape = client.tls.phrase(user, "mode.warn.dica_expiracao_rodape")
        } else
            embed.addFields({ name: "⠀", value: "⠀", inline: true })

    // Anotações de advertência com prazo de expiração
    if (id_warn === "pre_warn_create" && guild.warn.hierarchy.timed) {
        embed.addFields({
            name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "menu.botoes.expiracao")}**`,
            value: `**${client.tls.phrase(user, "mode.warn.remocao_em")} \`${client.tls.phrase(user, `menu.times.${defaultEraser[guild.warn.hierarchy.reset]}`)}\`**\n( <t:${client.timestamp() + defaultEraser[guild.warn.hierarchy.reset]}:f> )`,
            inline: true
        })

        texto_rodape = client.tls.phrase(user, "mode.anotacoes.dica_rodape")
    }

    embed.setFooter({
        text: texto_rodape,
        iconURL: interaction.user.avatarURL({ dynamic: true })
    })

    // Criando os botões para o menu de advertências
    const row = client.create_buttons([
        { id: id_warn, name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${guild_member.id}` },
        { id: id_warn, name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${guild_member.id}` }
    ], interaction)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}