const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("cazalbe")
		.setDescription("⌠😂⌡ Cazalbe King of Prasody")
		.setDescriptionLocalizations({
			"de": '⌠😂⌡ Cazalbe König von Prasody',
			"es-ES": '⌠😂⌡ Cazalbe Rey de Prasodia',
			"fr": '⌠😂⌡ Cazalbe Roi de Prasody',
			"it": '⌠😂⌡ Cazalbe Re di Prasodia',
			"pt-BR": '⌠😂⌡ Cazalbe Rei da Prasódia',
			"ru": '⌠😂⌡ Касальбе, король Прасоди'
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
					{ name: '😹 Laugh', value: 'laugh' },
					{ name: '🤡 Joke', value: 'joke' },
					{ name: '👾 Gif', value: 'gif' }
				)
				.setRequired(true)),
	async execute({ client, interaction }) {

		// Redirecionando o evento
		require(`./subcommands/cazalbe_${interaction.options.getString("operation")}`)({ client, interaction })
	}
}