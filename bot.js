const { PermissionsBitField } = require('discord.js')

const { CeiraClient } = require('./client')
const { slash_commands } = require('./commands')
const { internal_functions } = require('./functions')

const idioma = require('./core/data/language')
const database = require('./core/database/database')

const { nerfa_spam } = require('./core/events/spam')
const { checkUser, updateUser} = require('./core/database/schemas/User')
const { getUserRankServer } = require('./core/database/schemas/User_rank_guild')
const { verifySuspiciousLink } = require('./core/database/schemas/Spam_links')

let client = new CeiraClient()
internal_functions(client) // Registers the internal functions
slash_commands(client) // Updates the slash commands

client.discord.once("ready", async () => {

	console.log("🟠 | Executando etapas finais")

	// Setting the default language and value for ranking
	idioma.setDefault("pt-br")


	// client.cached.ranking_value = (await getBot(client.id())).persis.ranking || 5 // old db
	let bot = await client.prisma.bot.upsert({
		where: { id: client.id() },
		update: { },
		create: {
			id: client.id()
		}
	})
	client.cached.ranking_value = bot.persis_ranking;

	// Secondary events
	await require("./core/auto/clock")({ client })
	await require("./core/events/events")({ client })
	await require("./core/events/status")({ client })

	console.log(`🟢 | Caldeiras do(a) ${client.username()} aquecidas, pronto para operar`)
	console.log(`⏱️  | Tempo de inicialização: ${client.timestamp() - client.cached.timestamp > 1 ? `${client.timestamp() - client.cached.timestamp} segundos` : '1 segundo'}`)
})

client.discord.on("messageCreate", async message => {

	// Checking if the author is a bot or a webhook
	if (message.author.bot || message.webhookId) return

	// Prevents the bot from interacting with other members when in develop mode or updating commands
	if ((!process.env.owner_id.includes(message.author.id) && client.x.modo_develop) || client.x.force_update) return

	const user = await client.getUser(message.author.id, {
		conf: true,
		erase: true,
		profile: true
	})
	const guild = await client.getGuild(message.guild.id, { spam: true })

	// Responding to the user who just ping the bot
	if (message.content.includes(client.id()) && message.content.length === 21)
		if (await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], message))
			return message.reply({
				content: client.tls.phrase(user, "inic.inicio.apresentacao", client.emoji("emojis_dancantes")),
				components: [client.create_buttons([{ name: client.tls.phrase(user, "inic.inicio.convidar"), type: 4, emoji: client.emoji("mc_coracao"), value: `https://discord.com/oauth2/authorize?client_id=${client.id()}&scope=bot&permissions=2550136990` }], message)]
			}).catch(console.error)

	if (guild.spam.suspicious_links) { // Checking the text for a malicious link

		const link = `${message.content} `.match(client.cached.regex)

		if (link)
			if (await verifySuspiciousLink(client, link)) {
				const suspect_link = true
				return nerfa_spam({ client, message, guild, suspect_link })
			}
	}

	if (guild.spam.enabled) // Server anti-spam system
		await require("./core/events/spam")({ client, message, guild })

	if (user) { // It only runs if the member is saved in the database
		let user_rank_guild = await getUserRankServer(client, user.id, message.guild.id)

		// Ignoring banned users and those moved to data deletion
		if (user.conf?.banned || user.erase.valid || user_rank_guild.erase_valid) return

		// Syncing user data
		if (!user.profile.avatar || !user.profile.avatar?.includes(message.author.avatar)) {

			const user_guild = await client.getMemberGuild(message, user.id)
			await client.prisma.userOptionsProfile.update({
				where: { id: user.profile_id },
				data: { avatar: user_guild.user.avatarURL({ dynamic: true }) }
			})
		}

		if (!user.nick) {
			await updateUser(client, user.id, { nick: message.author.username })
		}

		// Updating users' XP, experience received by the user
		client.registryExperience(message, "messages")
	}
})

client.discord.on("interactionCreate", async interaction => {

	// Prevents the bot from responding to interactions while updating commands
	if (client.x.force_update) return

	const user = await client.getUser(interaction.user.id, {
		conf: true,
		erase: true
	})

	// Prevents the bot from interacting with other members when in develop mode
	if (!process.env.owner_id.includes(interaction.user.id) && client.x.modo_develop)
		return client.tls.reply(interaction, user, "inic.inicio.testes", true, 60)

	if (user?.conf.banned) return // Ignoring users

	// Checking if it is a command used on a server
	if (!interaction.guild) return client.tls.reply(interaction, user, "inic.error.comando_dm")

	if (interaction.isStringSelectMenu()) // Interactions generated when using selection menus
		return require("./core/interactions/menus")({ client, user, interaction })

	if (interaction.isButton()) // Interactions generated when using buttons
		return require("./core/interactions/buttons")({ client, user, interaction })

	if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return

	// Automatically sets the user's language if they don't have a default language
	if (!user.lang) await client.verifyUserLanguage(user, interaction.guild.id)

	const command = client.discord.commands.get(interaction.commandName.toLowerCase())

	// Removing the user data deletion label
	if (user.erase.valid) {
		await client.prisma.userOptionsErase.update({
			where: { id: user.erase_id },
			data: { forced: false }
		})
	}

	if (!command) return
	const action = interaction.isContextMenuCommand() ? command.menu : command.execute

	try {
		// Executing the command
		await action({ client, interaction })
		await require("./core/events/log")({ client, interaction, command })

		// Updating the last interaction
		client.cached.last_interaction = client.timestamp()
	} catch (err) {
		await client.error(err, "Slash Command")
		client.tls.reply(interaction, user, "inic.error.epic_embed_fail", true, client.emoji(0))
	}
})

// Conectando ao banco de dados
database.setup(process.env.url_dburi)
client.login(client.x.token)