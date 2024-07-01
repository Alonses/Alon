const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { ActivityType } = require('discord.js')

const { activities } = require('../../files/json/text/activities.json')

let selected = [], timeout_presence, status_atual

const actionTypes = [ActivityType.Playing, ActivityType.Watching, ActivityType.Listening]

module.exports = async ({ client }) => {

    // Impede que o bot atualize o status
    if (client.x.force_update) return

    if (client.x.status) {
        setTimeout(() => {
            requisita_status(client)
        }, 10000)
    } else
        client.user().setActivity("💣 Baidu explosivo", { type: ActivityType.Playing })
}

async function requisita_status(client) {

    let num

    if (selected.length === activities.length)
        selected = []

    do { // Repetirá enquanto o número já tiver sido escolhido
        num = client.random(activities)
    } while (selected.includes(num))

    let tempo_minimo = 0

    // Tempo mínimo para atividade "ouvindo"
    if (activities[num].type === 2)
        tempo_minimo = client.random(50000, 60000)

    // Tempo mínimo para atividade "assistindo"
    if (activities[num].type === 1)
        tempo_minimo = client.random(50000, 80000)

    let texto_status = activities[num].text

    if (texto_status.includes("server_repl"))
        texto_status = texto_status.replace("server_repl", client.guilds().size)

    if (texto_status.includes("canais_repl"))
        texto_status = texto_status.replace("canais_repl", client.channels(0).size)

    if (texto_status.includes("activities_repl"))
        texto_status = texto_status.replace("activities_repl", activities.length)

    if (texto_status.includes("version_repl")) {
        const bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })
        texto_status = texto_status.replace("version_repl", bot.persis_version)
    }

    if (texto_status.includes("commands_repl")) {
        const bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })
        texto_status = texto_status.replace("commands_repl", bot.persis_commands)
    }

    // Exibindo o status personalizado de forma aleatória por um tempo
    client.user().setActivity(texto_status, { type: actionTypes[activities[num].type] })
    client.cached.presence = num // Registrando o número do status atual

    // Solicitando um novo status personalizado
    timeout_presence = setTimeout(() => {
        requisita_status(client)
    }, 15000 + client.random(5000, tempo_minimo))
}

module.exports.requisita_status = requisita_status