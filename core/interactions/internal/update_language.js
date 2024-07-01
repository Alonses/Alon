const { existsSync, mkdirSync, writeFileSync } = require('fs')

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

module.exports = async ({ client, interaction }) => {

    if (!existsSync(`./files/languages/`))
        mkdirSync(`./files/languages/`, { recursive: true })

    fetch("https://github.com/Alonses/Alondioma")
        .then(response => response.text())
        .then(async res => {

            // Salvando o commit de traduções mais recente no banco 
            const cod_commit = res.split("<include-fragment src=\"/Alonses/Alondioma/spoofed_commit_check/")[1].split("\"")[0].slice(0, 7)

            await client.prisma.bot.update({ where: { id: client.id() }, data: { persis_alondioma: cod_commit }})

            interaction.reply({
                content: `:sa: | Pacote de traduções do Alonsal sincronizado com o commit \`${cod_commit}\``,
                ephemeral: true
            })

            if (client.id() === process.env.client_1) // Notifica apenas caso seja o bot principal
                client.notify(process.env.channel_feeds, { content: `:sa: | Pacote de traduções do ${client.username()} sincronizado com o commit \`${cod_commit}\`` })

            fetch("https://api.github.com/repos/Alonses/Alondioma/contents/")
                .then(res => res.json())
                .then(content => {
                    for (let i = 0; i < content.length; i++) {
                        const idioma = content[i]

                        if (!idioma.name.endsWith(".json")) continue

                        fetch(idioma.download_url)
                            .then(res => res.json())
                            .then(res => { writeFileSync(`./files/languages/${idioma.name}`, JSON.stringify(res)) })
                    }
                })
        })
}