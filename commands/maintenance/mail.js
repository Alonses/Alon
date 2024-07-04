const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mail")
        .setDescription("⌠📡⌡ Send messages to me!")
        .setDescriptionLocalizations({
            "de": '⌠📡⌡ Schreib mir eine Nachricht!',
            "es-ES": '⌠📡⌡ ¡Envíeme un mensaje!',
            "fr": '⌠📡⌡ Envoyez-moi un message!',
            "it": '⌠📡⌡ Mandami un messaggio!',
            "pt-BR": '⌠📡⌡ Envie mensagens para mim!',
            "ru": '⌠📡⌡ Пишите мне!'
        })
        .addStringOption(option =>
            option.setName("text")
                .setNameLocalizations({
                    "es-ES": 'texto',
                    "fr": 'texte',
                    "it": 'testo',
                    "pt-BR": 'texto',
                    "ru": 'текст'
                })
                .setDescription("Report bugs or give suggestions!")
                .setDescriptionLocalizations({
                    "de": 'Melden Sie Fehler oder machen Sie Vorschläge!',
                    "es-ES": '¡Informar de errores o dar sugerencias!',
                    "fr": 'Signalez des bugs ou faites des suggestions!',
                    "it": 'Segnala bug o dai suggerimenti!',
                    "pt-BR": 'Reporte bugs ou dê sugestões!',
                    "ru": 'Сообщайте об ошибках или делайте предложения!'
                })
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName("file")
                .setNameLocalizations({
                    "de": 'datei',
                    "es-ES": 'archivo',
                    "fr": 'dossier',
                    "it": 'file',
                    "pt-BR": 'arquivo',
                    "ru": 'архив'
                })
                .setDescription("Attach files if needed")
                .setDescriptionLocalizations({
                    "de": 'Hängen Sie bei Bedarf Dateien an',
                    "es-ES": 'Adjunte archivos si es necesario',
                    "fr": 'Joindre des fichiers si besoin',
                    "it": 'Allega file se necessario',
                    "pt-BR": 'Anexe arquivos se precisar',
                    "ru": 'Прикрепите файлы, если необходимо'
                })),
    async execute({ client, user, interaction }) {

        const corpo_mensagem = {
            text: interaction.options.getString("text"),
            file: interaction.options.getAttachment("file"),
        }

        let conteudo_texto = ""

        if (corpo_mensagem.file) {

            conteudo_texto = `[Clique aqui](${corpo_mensagem.file.attachment}) para baixar o arquivo`

            // Verificando se o anexo é um arquivo de texto
            if (corpo_mensagem.file.contentType.includes("text/plain"))
                conteudo_texto += `\`\`\`${client.defaultEmoji("paper")} Arquivo anexado:\n${await formataArquivo(corpo_mensagem.file)}\`\`\``
        }

        const embed = new EmbedBuilder()
            .setTitle("> Nova mensagem! :mailbox_with_mail:")
            .setColor(0xffffff)
            .setDescription(`-----------------------\nEnviado por ${client.emoji("icon_id")} \`${interaction.user.id}\`\n<@${interaction.user.id}>\n\n Mensagem: \`${client.replace(corpo_mensagem.text, null, ["`", "'"])}\`\n${conteudo_texto}`)
            .setTimestamp()
            .setFooter({
                text: `Autor: ${interaction.user.username}`,
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })

        // Inserindo uma imagem no embed
        if (corpo_mensagem.file)
            embed.setImage(corpo_mensagem.file.attachment)

        client.tls.reply(interaction, user, "manu.mail.sucesso_1", true, 31)
        client.notify(process.env.channel_mail, { embeds: [embed] })
    }
}

formataArquivo = async (attachment) => {
    const response = await fetch(attachment.attachment)
    const data = await response.text()

    return data.trim().slice(0, 1000)
}