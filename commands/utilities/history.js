const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("⌠💡|🇧🇷⌡ Fatos que ocorreram no mundo em determinada data")
        .addSubcommand(subcommand =>
            subcommand
                .setName("unico")
                .setDescription("⌠💡|🇧🇷⌡ Apenas um acontecimento")
                .addStringOption(option =>
                    option.setName("data")
                        .setDescription("Uma data específica, neste formato 21/01"))
                .addIntegerOption(option =>
                    option.setName("especifico")
                        .setDescription("1, 2, 3...")
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("lista")
                .setDescription("⌠💡|🇧🇷⌡ Listar todos os acontecimentos do dia")
                .addStringOption(option =>
                    option.setName("data")
                        .setDescription("Uma data específica, neste formato 21/01"))),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        let data = ""

        if (interaction.options.getString("data")) // Data customizada
            data = `?data=${interaction.options.getString("data")}`

        // Aumentando o tempo de duração da resposta
        await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

        if (interaction.options.getSubcommand() === "lista") // Lista de eventos
            await require('../../core/formatters/chunks/model_history')(client, data, interaction)
        else {

            // Apenas um acontecimento
            let especifico = "acon=alea"

            if (interaction.options.getInteger("especifico"))
                especifico = `acon=${interaction.options.getInteger("especifico")}`

            // Filtrando os valores de entrada caso tenham sido declarados
            if (data.length > 0)
                especifico = `&${especifico}`

            const dados = {
                data: data,
                especifico: especifico
            }

            await require('../../core/formatters/chunks/model_history')(client, dados, interaction)
        }
    }
}