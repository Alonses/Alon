const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("jailson")
		.setDescription("⌠😂⌡ So I can't resist, vaiinn")
		.setDescriptionLocalizations({
			"de": '⌠😂⌡Ich kann nicht widerstehen, waiinn',
			"es-ES": '⌠😂⌡ Así que no puedo resistirme, vaiinn',
			"fr": '⌠😂⌡ Alors je ne peux pas résister, vaiinn',
			"it": '⌠😂⌡ Quindi non posso resistere, vaiinn',
			"pt-BR": '⌠😂⌡ Assim eu não resisto, vaiinn',
			"ru": '⌠😂⌡ Так что не могу устоять, ваиинн'
		})
		.addStringOption(option =>
			option.setName("operation")
				.setNameLocalizations({
					"de": 'betrieb',
					"es-ES": 'operacion',
					"fr": 'operation',
					"it": 'operazione',
					"pt-BR": 'operacao',
					"ru": 'операция'
				})
				.setDescription("Select an operation")
				.setDescriptionLocalizations({
					"de": 'Wählen Sie einen Vorgang aus',
					"es-ES": 'Seleccione una operación',
					"fr": 'Sélectionnez une opération',
					"it": 'Seleziona un\'operazione',
					"pt-BR": 'Escolha uma operação',
					"ru": 'Выберите операцию'
				})
				.addChoices(
					{ name: '💬 Phrase', value: 'phrase' },
					{ name: '👾 Gif', value: 'gif' }
				)
				.setRequired(true)),
	async execute({ client, interaction }) {
		const user = await client.getUser(interaction.user.id)
		if (!interaction.channel.nsfw)
			return client.tls.reply(interaction, user, "dive.jaja", true, 33)

		// Redirecionando o evento
		require(`./subcommands/jailson_${interaction.options.getString("operation")}`)({ client, interaction })
	}
}