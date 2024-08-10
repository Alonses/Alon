const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    menu_data: new ContextMenuCommandBuilder()
        .setName("Avatar")
        .setType(ApplicationCommandType.User),
    async menu({ client, interaction }) {

        // Redirecionando o evento
        await require("../subcommands/user_avatar")({client, interaction})
    }
}