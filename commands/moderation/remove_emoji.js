const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js')

const { emojis } = require('../../files/json/text/emojis.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("⌠💂⌡ Remove emojis from the server")
        .addSubcommand(subcommand =>
            subcommand
                .setName("emoji")
                .setDescription("⌠💂⌡ Remove an emoji")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Ein Emoji entfernen',
                    "es-ES": '⌠💂⌡ Eliminar un emoji',
                    "fr": '⌠💂⌡ Supprimer un emoji',
                    "it": '⌠💂⌡ Rimuovi un\'emoji',
                    "pt-BR": '⌠💂⌡ Remover um emoji',
                    "ru": '⌠💂⌡ Удалить эмодзи с сервера'
                })
                .addStringOption(option =>
                    option.setName("name")
                        .setNameLocalizations({
                            "es-ES": 'nombre',
                            "fr": 'nom',
                            "it": 'nome',
                            "pt-BR": 'nome',
                            "ru": 'имя'
                        })
                        .setDescription(":the name of the emoji:")
                        .setDescriptionLocalizations({
                            "de": ':der Name des Emojis:',
                            "es-ES": ':el nombre del emoji:',
                            "fr": ':le nom de l\'emoji:',
                            "it": ':il nome dell\'emoji:',
                            "pt-BR": ":o nome do emoji:",
                            "ru": ':название смайлика:'
                        })
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id)

        // Verificando se o bot pode gerenciar emojis e stickers
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageEmojisAndStickers]))
            return client.tls.reply(interaction, user, "mode.emojis.permissao", true, 3)

        const dados = interaction.options.getString("name")

        try { // Removendo um emoji customizado do servidor
            if (dados.startsWith("<") && dados.endsWith(">")) {
                const id = dados.match(/\d{15,}/g)[0]

                // Verificando se o emoji é usado pelo bot
                if (JSON.stringify(emojis).includes(id))
                    return client.tls.reply(interaction, user, "mode.emojis.emoji_reservado", true, client.emoji(0))

                // Confirmando se o emoji é do servidor e excluindo
                await interaction.guild.emojis.fetch(`${id}`)
                    .then(emoji => {
                        let nome = emoji.name

                        emoji.delete()
                            .then(() => client.tls.reply(interaction, user, "mode.emojis.emoji_removido", true, 13, nome))
                            .catch(() => client.tls.reply(interaction, user, "mode.emojis.emoji_error_remover", true, client.emoji(0)))
                    })
                    .catch(() => { return client.tls.reply(interaction, user, "mode.emojis.emoji_estrangeiro", true, 1) })
            } else return client.tls.reply(interaction, user, "mode.emojis.emoji_custom_remover", true, 2)
        } catch {
            return client.tls.reply(interaction, user, "mode.emojis.emoji_custom_remover", true, 2)
        }
    }
}