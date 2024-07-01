const { EmbedBuilder } = require('discord.js')

const formata_horas = require('../formatters/formata_horas.js')

module.exports = async ({ client, interaction, command }) => {

    if (client.x.relatorio) {

        const bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })
        const qtd_comandos = ++bot.persis_commands
        await client.prisma.bot.update( {
            where: { id: client.id() },
            data: { persis_commands: qtd_comandos },
        })

        const today = new Date()
        const day = today.toLocaleString("en-US", { weekday: "long" })

        let url_ativacao = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.id}`
        let min = formata_horas(today.getMinutes()), hr = formata_horas(today.getHours())

        let ampm = "am"
        if (hr > 12) {
            hr -= 12
            ampm = "pm"
        }

        let comando_inserido = interaction.commandName, entradas = []
        let filtrador = interaction.options.data

        filtrador.forEach(valor => {
            // Listando todos os parâmetros usados na interação
            let entrada = `${valor.name}: ⬛`
            let opcoes_internas_comando = []

            if (!valor.value)
                entrada = valor.name

            if (valor.options) { // Opções internas da interação
                opcoes_comando = valor.options
                opcoes_comando.forEach(opcao => {

                    opcao_interna = `${opcao.name}: ⬛`

                    if (!opcao.value)
                        opcao_interna = ""

                    opcoes_internas_comando.push(opcao_interna)
                })

                // Mesclando as opções internas com o possível subcomando da interação
                entrada = `${entrada} ${opcoes_internas_comando.join(" ")}`
            }

            entradas.push(entrada)
        })

        comando_inserido = `${comando_inserido} ${entradas.join(" ")}`
        comando_inserido = comando_inserido.toLowerCase()

        const date = today.getDate(), year = today.getFullYear()
        const month = today.toLocaleString("en-US", { month: "long" })

        const embed = new EmbedBuilder()
            .setTitle("> ✨ New interaction")
            .setColor(0x29BB8E)
            .setDescription(`:globe_with_meridians: ( \`${interaction.guild.id}\` | \`${interaction.guild.name}\` )\n${client.defaultEmoji("person")} ( \`${interaction.user.id}\` | \`${interaction.user.username}\` )\n\`\`\`fix\n📝 /${comando_inserido}\`\`\`\n:notepad_spiral: Command N° ( \`${client.locale(qtd_comandos)}\` )`)
            .setFooter({
                text: `⏰ Time/date: ${hr}:${min}${ampm} | ${day} - ${date} ${month} ${year}`
            })

        if (url_ativacao !== "")
            embed.setURL(`${url_ativacao}`)

        // Envia um log de telemetria com o comando disparado
        client.notify(process.env.channel_command, { embeds: [embed] })
    }

    // Experiência recebida pelo usuário
    client.registryExperience(interaction, "comando")
}