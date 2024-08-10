const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_send_vote")
        .setDescription("⌠🤖⌡ Envie o embed de votação em algum servidor!")
        .addStringOption(option =>
            option.setName("canal")
                .setDescription("O canal que será enviado")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id)
        if (!client.x.owners.includes(interaction.user.id)) return

        const id_alvo = interaction.options.getString("canal")
        const canal_alvo = client.discord.channels.cache.get(id_alvo)

        const embed = new EmbedBuilder()
            .setTitle(`${client.tls.phrase(user, "inic.vote.titulo")} ${client.emoji("emojis_dancantes")}`)
            .setColor(0x29BB8E)
            .setDescription(`${client.tls.phrase(user, "inic.vote.descricao", [client.emoji("emojis_dancantes"), client.emoji("emojis_dancantes")])} <t:1692460800:f>!\n\n:flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp:\n:flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de:\n:flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl:`)
            .setFooter({
                text: client.tls.phrase(user, "inic.vote.rodape")
            })

        const row = client.create_buttons([
            { id: "vote_button", name: 'Deutsch', emoji: "🇩🇪", type: 1, data: "de" },
            { id: "vote_button", name: 'Nederlands', emoji: "🇳🇱", type: 1, data: "nl" },
            { id: "vote_button", name: 'Svenska', emoji: "🇸🇪", type: 1, data: "se" },
            { id: "vote_button", name: 'Türkçe', emoji: "🇹🇷", type: 1, data: "tr" },
            { id: "vote_button", name: '日本語', emoji: "🇯🇵", type: 1, data: "jp" }
        ], interaction)

        if (canal_alvo) {
            // Enviando os anúncios para os canais
            if (canal_alvo.type === 0 || canal_alvo.type === 5) {

                // Permissão para enviar mensagens no canal
                if (await client.permissions(null, client.id(), [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], canal_alvo)) {
                    interaction.reply({
                        content: `:mailbox: | O embed de votação foi enviado ao canal <#${id_alvo}> com sucesso!`,
                        ephemeral: true
                    })

                    client.notify(id_alvo, { embeds: [embed], components: [row] })
                } else
                    interaction.reply({
                        content: `${client.defaultEmoji("guard")} | Eu não posso enviar mensagens nesse canal ( <#${id_alvo}> ) por falta de permissões.`,
                        ephemeral: true
                    })
            } else
                interaction.reply({
                    content: ":o: | O tipo do canal definido não é de texto, por favor tente novamente",
                    ephemeral: true
                })
        } else
            interaction.reply({
                content: ":mag: | O canal mencionado não existe.",
                ephemeral: true
            })
    }
}