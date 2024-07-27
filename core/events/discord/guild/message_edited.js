const { EmbedBuilder } = require('discord.js')

// const compare_messages = require('../../../functions/compare_messages')

module.exports = async (client, message) => {

    // Verificando se o autor da mensagem editada é o bot
    if (message[0].partial || message[0].author.bot) return

    // Mensagem com o mesmo conteúdo (links de gifs e imagens)
    if (message[0].content === message[1].content) return

    const guild = await client.getGuild(message[0].guildId)

    // Verificando se a guild habilitou o logger
    if (!guild.logger_message_edit || !guild.conf_logger) return

    // const alteracoes = comparar_edicoes(formata_text(message[0].content), formata_text(message[1].content))
    const alteracoes = {
        antigo: client.replace(message[0].content, null, ["`", "'"]),
        novo: client.replace(message[1].content, null, ["`", "'"])
    }

    // Sem texto incluso na mensagem antiga
    if (alteracoes.antigo.length < 1) alteracoes.antigo = client.tls.phrase(guild, "mode.logger.sem_texto")

    // Relatório resumido das alterações entre as mensagens
    // if (alteracoes.antigo.length > 50 || alteracoes.novo.length > 50) {

    //     const relatorio_alteracoes = compare_messages(alteracoes.antigo, alteracoes.novo)

    //     alteracoes.antigo = relatorio_alteracoes.antigo.join("\n\n")
    //     alteracoes.novo = relatorio_alteracoes.novo.join("\n\n")
    // }

    let texto = client.tls.phrase(guild, "mode.logger.resumo_atualizado", client.emoji(39), [message[0].author.id, message[0].url, alteracoes.antigo.slice(0, 500), alteracoes.novo.slice(0, 500)])

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.logger.mensagem_editada"))
        .setColor(0xffffff)
        .setFields(
            {
                name: client.user_title(message[0].author, guild, "mode.logger.autor"),
                value: `${client.emoji("icon_id")} \`${message[0].author.id}\`\n${client.emoji("mc_name_tag")} \`${message[0].author.username}\`\n( <@${message[0].author.id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("paper")} **${client.tls.phrase(guild, "util.rastreio.local")}**`,
                value: `${client.emoji("icon_id")} \`${message[0].channelId}\`\n:placard: \`${message[0].channel.name}\`\n( <#${message[0].channelId}> )`,
                inline: true
            }
        )
        .setTimestamp()

    const attachments = []

    if (message[1].attachments)
        message[1].attachments.forEach(attach => {
            attachments.push(attach.attachment)
        })

    if (attachments.length > 0) // Arquivos anexados
        texto = `${texto}\n**${client.tls.phrase(guild, "mode.logger.anexos")}:**\n${attachments.join("\n\n")}`

    embed.setDescription(texto)

    client.notify(guild.logger_channel, { embeds: [embed] })
}