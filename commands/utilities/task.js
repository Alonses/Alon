const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tasks")
        .setNameLocalizations({
            "de": 'aufgaben',
            "es-ES": 'tareas',
            "fr": 'taches',
            "it": 'appunti',
            "pt-BR": 'tarefas',
            "ru": 'задания'
        })
        .setDescription("⌠💡⌡ Create tasks and lists")
        .addSubcommand(subcommand =>
            subcommand
                .setName("browse")
                .setNameLocalizations({
                    "de": 'sehen',
                    "es-ES": 'navegar',
                    "fr": 'voir',
                    "it": 'navigare',
                    "pt-BR": "navegar",
                    "ru": 'просматривать'
                })
                .setDescription("⌠💡⌡ See your tasks and lists")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Sehen Sie sich Ihre Aufgaben und Listen an',
                    "es-ES": '⌠💡⌡ Ver tus tareas y listas',
                    "fr": '⌠💡⌡ Consultez vos tâches et listes',
                    "it": '⌠💡⌡ Visualizza le tue attività ed elenchi',
                    "pt-BR": '⌠💡⌡ Veja as suas tarefas e listas',
                    "ru": '⌠💡⌡ Просматривайте свои задачи и списки'
                })
                .addStringOption(option =>
                    option.setName("status")
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
                            { name: '⏳ Available', value: 'a' },
                            { name: '✅ Completed', value: 'f' },
                            { name: '📝 Lists', value: 'l' }
                        )
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setNameLocalizations({
                    "de": 'hinzufügen',
                    "es-ES": 'agregar',
                    "fr": 'ajouter',
                    "it": 'aggiungere',
                    "pt-BR": 'adicionar',
                    "ru": 'добавить'
                })
                .setDescription("⌠💡⌡ Add tasks and lists")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Aufgaben und Listen hinzufügen',
                    "es-ES": '⌠💡⌡ Agregar tareas y listas',
                    "fr": '⌠💡⌡ Ajouter des tâches et des listes',
                    "it": '⌠💡⌡ Aggiungi attività ed elenchi',
                    "pt-BR": '⌠💡⌡ Adicione tarefas e listas',
                    "ru": '⌠💡⌡ Добавляйте задачи и списки'
                })
                .addStringOption(option =>
                    option.setName("scope")
                        .setNameLocalizations({
                            "de": 'umfang',
                            "es-ES": 'alcance',
                            "fr": 'portee',
                            "it": 'scopo',
                            "pt-BR": 'escopo',
                            "ru": 'тип'
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
                            { name: '🔖 Task', value: 'task' },
                            { name: '📝 List', value: 'list' }
                        )
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("description")
                        .setNameLocalizations({
                            "de": 'beschreibung',
                            "es-ES": 'descripcion',
                            "it": 'descrizione',
                            "pt-BR": 'descricao',
                            "ru": 'описание'
                        })
                        .setDescription("What will be noted?")
                        .setDescriptionLocalizations({
                            "de": 'Beschreiben Sie Ihre Aufgabe',
                            "es-ES": 'Describe tu tarea',
                            "fr": 'Décrivez votre tâche',
                            "it": 'Descrivi il tuo compito',
                            "pt-BR": 'O que será anotado?',
                            "ru": 'опишите вашу задачу'
                        })
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("delete")
                .setNameLocalizations({
                    "de": 'löschen',
                    "es-ES": 'borrar',
                    "fr": 'supprimer',
                    "it": 'eliminare',
                    "pt-BR": 'excluir',
                    "ru": 'удалить'
                })
                .setDescription("⌠💡⌡ Delete tasks or lists")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Aufgaben oder Listen entfernen',
                    "es-ES": '⌠💡⌡ Eliminar tareas o listas',
                    "fr": '⌠💡⌡ Supprimer des tâches ou des listes',
                    "it": '⌠💡⌡ Elimina attività o elenchi',
                    "pt-BR": '⌠💡⌡ Remova tarefas ou listas',
                    "ru": '⌠💡⌡Удалить задачи или списки'
                })
                .addStringOption(option =>
                    option.setName("scope")
                        .setNameLocalizations({
                            "de": 'umfang',
                            "es-ES": 'alcance',
                            "fr": 'portee',
                            "it": 'scopo',
                            "pt-BR": 'escopo',
                            "ru": 'тип'
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
                            { name: '🔖 Task', value: 'task' },
                            { name: '📝 List', value: 'list' }
                        )
                        .setRequired(true))),
    async execute({ client, interaction }) {
        let autor_original = true

        if (interaction.options.getSubcommand() === "browse") {
            const operador = `${interaction.options.getString("status")}|tarefas`

            if (interaction.options.getString("status") === "l")
                await require('../../core/interactions/chunks/listas_navegar')({
                    client,
                    interaction,
                    autor_original
                })
            else
                await require('../../core/interactions/chunks/tarefas')({
                    client,
                    interaction,
                    operador,
                    autor_original
                })
        } else {

            // Listando qual será o escopo da função
            const operacao = interaction.options.getSubcommand()
            const alvo = interaction.options.getString("scope")

            require(`./subcommands/tasks_${operacao}_${alvo}`)({ client, interaction, autor_original })
        }
    }
}