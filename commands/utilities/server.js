const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("⌠💡⌡ Show server information")
        .addSubcommand(subcommand =>
            subcommand
                .setName("icon")
                .setDescription("⌠💡⌡ The server icon")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Das Serversymbol',
                    "es-ES": '⌠💡⌡ El icono del servidor',
                    "fr": '⌠💡⌡ L\'icône du serveur',
                    "it": '⌠💡⌡ L\'icona del server',
                    "pt-BR": '⌠💡⌡ O Icone do servidor',
                    "ru": '⌠💡⌡ Значок сервера'
                }))
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setDescription("⌠💡⌡ Server information")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Serverinformationen',
                    "es-ES": '⌠💡⌡ Información del servidor',
                    "fr": '⌠💡⌡ Informations sur le serveur',
                    "it": '⌠💡⌡ Informazioni sul server',
                    "pt-BR": '⌠💡⌡ Informações do servidor',
                    "ru": '⌠💡⌡ Информация о сервере'
                })),
    async execute({ client, interaction }) {

        // Solicitando a função e executando
        require(`./subcommands/server_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}