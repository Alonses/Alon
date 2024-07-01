const { existsSync, mkdirSync, writeFileSync, readdirSync } = require('fs')

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

let default_lang

// Carrega todos os idiomas do bot diretamente do git
async function loadAll(client) {

    // Previne que o bot atualize seus pacotes de idioma caso esteja atualizando seus comandos ( localmente )
    if (client.x.force_update) return

    if (!existsSync(`./files/languages/`))
        mkdirSync(`./files/languages/`, { recursive: true })

    const bot = await client.prisma.bot.findUnique({ where: { id: client.id() } })

    fetch("https://github.com/Alonses/Alondioma")
        .then(response => response.text())
        .then(async res => {

            // Buscando o commit mais recente
            const cod_commit = res.split("<include-fragment src=\"/Alonses/Alondioma/spoofed_commit_check/")[1].split("\"")[0].slice(0, 7)

            // Sincroniza com os idiomas mais recentes caso haja atualização ou não haja arquivos
            if (cod_commit !== bot.persis_alondioma || !existsSync(`./files/languages/pt-br.json`)) {
                console.log("🟠 | Sincronizando com as traduções mais recentes.")

                // Salvando o commit de traduções mais recente no banco
                await client.prisma.bot.update( { where: { id: client.id() }, data: { persis_alondioma: cod_commit } })

                if (client.id() === process.env.client_1 && process.env.channel_feeds) // Notifica no canal apenas para o bot principal
                    client.channels().get(process.env.channel_feeds).send({ content: `:sa: | Pacote de traduções do ${client.username()} sincronizado com o commit \`${cod_commit}\`` })
                else console.log(`🈂️ | Pacote de traduções do ${client.username()} sincronizado com o commit ${cod_commit}`)

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
            }
        })
}

// Lista todas as bandeiras de idiomas carregados
function listAll() {
    const bandeiras = []
    let i = 0

    for (const file of readdirSync('./files/languages/')) {

        let bandeira = file.slice(0, 5) !== "al-br" ? `:flag_${file.slice(3, 5)}:` : ":pirate_flag:"

        if (file.slice(0, 5) === "pt-hp")
            bandeira = ":sunny:" // hopês

        if (!bandeiras.includes(bandeira))
            bandeiras.push(bandeira)

        i++
    }

    return bandeiras.join(" ")
}

function setDefault(lang) {
    default_lang = lang
}

function getLang() {
    return default_lang
}

module.exports = {
    setDefault,
    getLang,
    loadAll,
    listAll
}