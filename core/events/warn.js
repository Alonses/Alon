const { EmbedBuilder } = require('discord.js')

const { listAllUserWarns } = require("../database/schemas/User_warns")
const { listAllGuildWarns } = require("../database/schemas/Guild_warns")

const { spamTimeoutMap } = require('../formatters/patterns/timeout')

module.exports = async function ({ client, interaction, user, member_guild, user_warn, hierarquia }) {

    const id_alvo = user_warn.uid
    const guild = await client.getGuild(interaction.guild.id)
    const guild_warns = await listAllGuildWarns(interaction.guild.id)

    const active_user_warns = await listAllUserWarns(id_alvo, interaction.guild.id)
    const indice_warn = active_user_warns.length > guild_warns.length ? guild_warns.length - 1 : active_user_warns.length - 1

    let indice_matriz = client.verifyMatrixIndex(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

    // Embed de aviso para o servidor onde foi aplicada a advertência
    const embed_guild = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(guild, "mode.warn.titulo_advertencia")} :inbox_tray:`)
        .setColor(0xED4245)
        .setDescription(`${client.tls.phrase(guild, "mode.warn.usuario_nova_advertencia")}!\n\`\`\`fix\n📠 | ${client.tls.phrase(guild, "mode.warn.descricao_fornecida")}\n\n${user_warn.relatory}\`\`\``)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(guild, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${id_alvo}\`\n${client.emoji("mc_name_tag")} \`${user_warn.nick}\`\n( <@${id_alvo}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(guild, "util.user.entrada")}**`,
                value: `<t:${parseInt(member_guild.joinedTimestamp / 1000)}:F>`,
                inline: true
            },
            {
                name: `${client.emoji(47)} **${client.tls.phrase(guild, "mode.warn.advertencias")}: ${active_user_warns.length} / ${indice_matriz}**`,
                value: "⠀",
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(guild, "mode.warn.moderador_responsavel")}**`,
                value: `${client.emoji("icon_id")} \`${interaction.user.id}\`\n${client.emoji("mc_name_tag")} \`${interaction.user.username}\`\n( <@${interaction.user.id}> )`,
                inline: true
            }
        )
        .setTimestamp()

    if (guild.warn.timed) { // Advertência com prazo de expiração
        embed_guild
            .addFields({
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(guild, "menu.botoes.expiracao")}**`,
                value: `**${client.tls.phrase(guild, "mode.warn.remocao_em")} \`${client.tls.phrase(guild, `menu.times.${spamTimeoutMap[guild.warn_reset]}`)}\`**\n( <t:${client.timestamp() + spamTimeoutMap[guild.warn_reset]}:f> )`,
                inline: true
            })
            .setFooter({
                text: client.tls.phrase(guild, "mode.warn.dica_expiracao_rodape"),
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })
    } else
        embed_guild.addFields(
            {
                name: "⠀",
                value: "⠀",
                inline: true
            }
        )

    embed_guild.addFields({
        name: `${client.emoji("banidos")} **${client.tls.phrase(guild, "menu.botoes.penalidade")}**`,
        value: client.verifyAction(guild_warns[indice_warn], guild),
        inline: true
    })

    let canal_envio = guild.warn_channel, texto_embed = guild.warn_notify ? "@here" : ""

    // Altera o destino para o canal de avisos temporários
    if (guild.warn_timed_channel) interaction.channel.id = guild.warn_timed_channel

    // Envia uma mensagem temporária no canal onde foi gerada a advertência
    client.timed_message(interaction, { content: client.tls.phrase(guild, "mode.warn.anuncio_temporario", null, [id_alvo, `${active_user_warns.length} / ${indice_matriz}`, client.verifyAction(guild_warns[indice_warn], guild), client.timestamp() + 60]) }, 60)

    // Servidor com anúncio de advertências público configurado
    if (guild.warn_announce_status && guild.warn_announce_channel) {
        canal_envio = guild.warn_announce_channel
        texto_embed = `<@${id_alvo}>`

        embed_guild.setDescription(`\`\`\`fix\n📠 | ${client.tls.phrase(guild, "mode.warn.descricao_fornecida")}\n\n${user_warn.relatory}\`\`\``)
            .setFooter({
                text: "⠀",
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })
    }

    client.notify(canal_envio, {
        content: texto_embed, // Servidor com ping de advertência ativo
        embeds: [embed_guild]
    })

    if (guild_warns[indice_warn].action) // Usuário recebeu a uma advertência com penalidade
        if (guild_warns[indice_warn].action !== "none") {

            const guild_member = await client.getMemberGuild(interaction.guild.id, id_alvo)
            const bot_member = await client.getMemberGuild(interaction.guild.id, client.id())

            // Redirecionando o evento
            require(`./warn/${guild_warns[indice_warn].action.replace("_2", "")}`)({ client, user, interaction, guild, active_user_warns, user_warn, guild_member, bot_member })
        }

    if (guild_warns[indice_warn].role) { // Advertência atual acrescenta um cargo ao membro
        const dados = guild_warns[indice_warn], acionador = "warn"
        require('../auto/triggers/user_assign_role')({ client, guild, interaction, dados, acionador, indice_warn })
    }

    if (!hierarquia)
        return client.reply(interaction, {
            content: client.tls.phrase(user, "mode.warn.advertencia_registrada", 63),
            embeds: [],
            components: [],
            ephemeral: true
        })
}