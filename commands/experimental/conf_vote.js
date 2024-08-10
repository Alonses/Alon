const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const { getVotes } = require('../../core/database/schemas/Vote')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_vote")
        .setDescription("⌠🤖⌡ Verificar os resultados da votação")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, interaction }) {

        if (!client.x.owners.includes(interaction.user.id)) return

        const votos = await getVotes(client)

        if (client.timestamp() < 1692460800)
            interaction.reply({
                content: `${client.emoji("emojis_dancantes")} | Votos computados até o momento: \`${votos?.qtd || 0}\`\n${client.defaultEmoji("calendar")} | Contabilizando até <t:1692460800:f>`,
                ephemeral: true
            })
        else
            interaction.reply({
                content: `${client.emoji("emojis_dancantes")} | Resultados da votação de Idiomas!\nTotal de votos: \`${votos?.qtd || 0}\`\n\n:flag_de: ||\`${votos?.de || 0}\`||, :flag_nl: ||\`${votos?.nl || 0}\`||, :flag_se: ||\`${votos?.se || 0}\`||\n:flag_tr: ||\`${votos?.tr || 0}\`||, :flag_jp: ||\`${votos?.jp || 0}\`||`,
                ephemeral: true
            })
    }
}