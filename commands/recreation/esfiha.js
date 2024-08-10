const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("esfiha")
		.setDescription("⌠😂⌡ Serve??")
		.setDescriptionLocalizations({
			"de": '⌠😂⌡ Serviert??',
			"es-ES": '⌠😂⌡ Servido??',
			"fr": '⌠😂⌡ Servi??',
			"it": '⌠😂⌡ Servito??',
			"pt-BR": '⌠😂⌡ Servidos??',
			"ru": '⌠😂⌡ Подали??'
		}),
	async execute({ client, interaction }) {
		const user = await client.getUser(interaction.user.id, { conf: true })
		interaction.reply({
			content: `${client.tls.phrase(user, "dive.esfiha")} :yum: :yum: :yum:\nhttps://tenor.com/view/gil-das-esfihas-galerito-esfiha-meme-brasil-gif-21194713`,
			ephemeral: client.decider(user?.conf.ghost_mode, 0)
		})
	}
}