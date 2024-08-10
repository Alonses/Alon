const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    menu_data: new ContextMenuCommandBuilder()
        .setName("Info")
        .setType(ApplicationCommandType.User),
    async menu({ client, interaction }) {

        // Redirecionando o evento
        await require("../subcommands/user_info")({client, interaction})
    }
}