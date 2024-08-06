const { EmbedBuilder } = require("discord.js")

const { getVotes } = require("../database/schemas/Vote")

const msgs = {
    "828706023430160384": "1140839551330439258",
    "755119535555608647": "1140844096785764483",
    "530807134406049815": "1140843213905727629",
    "1141915745786286170": "1141915928053960734",
    "942796455230464000": "1140988518420721674",
    "644316273509138491": "1142252059605864578"
}

const idiomas = {
    "de": "alemão",
    "nl": "holândes",
    "se": "sueco",
    "tr": "turco",
    "jp": "japonês"
}

module.exports = async ({ client, estagio }) => {

    const user = {
        lang: "pt-br"
    }

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "inic.vote.titulo")} ${client.emoji("emojis_dancantes")} ${client.emoji("emojis_dancantes")} ${client.emoji("emojis_dancantes")}`)
        .setColor(0x29BB8E)
        .setFooter({
            text: client.tls.phrase(user, "inic.vote.rodape_encerrado")
        })

    const votos = await getVotes(client)

    if (estagio == 1)
        embed.setDescription(`${client.replace(`${client.tls.phrase(user, "inic.vote.votacao_encerrada_1")}\n\n${client.tls.phrase(user, "inic.vote.votacao_encerrada_3")}`, [votos.qtd, client.emoji("aln_voter"), client.emoji("emojis_dancantes")])}!\n\n:flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr:\n:flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp:\n:flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de: :flag_nl: :flag_se: :flag_tr: :flag_jp: :flag_de:`)

    if (estagio == 2) {

        let maior = {
            qtd: 0,
            name: null
        }

        // Ajustando o idioma com maior número de votos
        Object.keys(votos).forEach(voto => {
            if (votos[voto] > maior.qtd && voto !== "qtd") {
                maior.qtd = votos[voto]
                maior.name = voto
            }
        })

        let escolha = maior.name

        embed.setImage("https://media.tenor.com/ndfMtqlPeLcAAAAd/fireworks-anime-hanabi.gif")
        embed.setDescription(`${client.replace(`${client.tls.phrase(user, "inic.vote.votacao_encerrada_1")}\n\n${client.tls.phrase(user, "inic.vote.votacao_encerrada_2")}`, [votos.qtd, client.emoji("aln_voter"), maior.qtd, idiomas[escolha], client.emoji("emojis_dancantes"), client.emoji("emojis_dancantes")])}\n\n:flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}:\n:flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}:\n:flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}: :flag_${escolha}:`)
    }

    Object.keys(msgs).forEach(async mensagem => {

        const canal_alvo = client.discord.channels.cache.get(mensagem)
        await canal_alvo.messages.fetch(msgs[mensagem])
            .then(message => {
                message.edit({ embeds: [embed], row: [], components: [] })
            })
            .catch(() => {
                client.notify(process.env.channel_feeds, { content: `:ballot_box: | Um card de votação do canal <#${mensagem}> não foi encontrado, seu conteúdo não foi atualizado!` })
            })
    })
}