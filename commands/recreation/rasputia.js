const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rasputia")
		.setDescription("⌠😂⌡ Rasputia in its glory")
		.setDescriptionLocalizations({
			"de": '⌠😂⌡ Rasputia in seiner ganzen Pracht',
			"es-ES": '⌠😂⌡ Rasputia en todo su esplendor',
			"fr": '⌠😂⌡ Rasputia dans toute sa splendeur',
			"it": '⌠😂⌡ Rasputia in tutto il suo splendore',
			"pt-BR": '⌠😂⌡ Rasputia em sua glória',
			"ru": '⌠😂⌡ Распутия во всей красе'
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
					{ name: '🔊 Speaks', value: 'speaks' },
					{ name: '💬 Phrase', value: 'phrase' },
					{ name: '👾 Gif', value: 'gif' },
					{ name: '🧾 Menu', value: 'menu' }
				)
				.setRequired(true)),
	async execute({ client, interaction }) {

		// Redirecionando o evento
		require(`./subcommands/rasputia_${interaction.options.getString("operation")}`)({ client, interaction })
	}
}