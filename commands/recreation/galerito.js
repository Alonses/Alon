const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("galerito")
		.setDescription("⌠😂⌡ Rogéria!")
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
					{ name: '👾 Gif', value: 'gif' },
					{ name: '😇 Peace', value: 'peace' },
					{ name: '🧾 Menu', value: 'menu' }
				)
				.setRequired(true)),
	async execute({ client, interaction }) {

		// Redirecionando o evento
		require(`./subcommands/galerito_${interaction.options.getString("operation")}`)({ client, interaction })
	}
}