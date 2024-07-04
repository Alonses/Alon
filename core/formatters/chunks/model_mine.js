const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

module.exports = async (client, user, interaction) => {

    await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

    let url_pesquisa = `?idioma=${user.lang}`, nota_rodape

    // Entrada customizada, ativa caso o usuário tenha pesquisado por algo
    if (interaction && interaction.options.getString("item"))
        url_pesquisa += `&item=${interaction.options.getString("item")}`

    fetch(`${process.env.url_apisal}/mine${url_pesquisa}`)
        .then(response => response.json())
        .then(async dados_item => {

            // Erro de pesquisa com a API
            if (dados_item.status === 502)
                if (interaction) return client.tls.editReply(interaction, user, "util.minecraft.error_1", true, client.emoji(0))
                else return client.sendDM(user, { content: client.tls.phrase(user, "util.minecraft.error_1", client.emoji(0)) }, true)

            if (dados_item.status === 404 && interaction) // Sem item conhecido
                return client.tls.editReply(interaction, user, "util.minecraft.nao_encontrado", true, client.emoji("emojis_negativos"), interaction.options.getString("item"))

            let nome_item = dados_item.internal_name
            descricao_tipo = nome_item

            let colet_suv = client.tls.phrase(user, "util.minecraft.sim")
            let empilhavel = `${client.tls.phrase(user, "util.minecraft.ate")} ${dados_item.stats.stackable}`
            let renovavel = client.tls.phrase(user, "util.minecraft.sim")

            let tipo_item = dados_item.stats.type

            if (dados_item.stats.type === "construcao")
                tipo_item = client.tls.phrase(user, "util.minecraft.construcao")

            if (dados_item.type === "pocoes")
                tipo_item = client.tls.phrase(user, "util.minecraft.pocoes")

            if (dados_item.stats.renewable === 0)
                renovavel = client.tls.phrase(user, "util.minecraft.nao")

            if (dados_item.stats.stackable === 0)
                empilhavel = client.tls.phrase(user, "util.minecraft.nao")

            if (dados_item.stats.collectable === 0)
                colet_suv = client.tls.phrase(user, "util.minecraft.nao")

            let fields = { name: "⠀", value: "⠀" }
            let valores_item = ''

            if (user.lang !== "pt-br" && user.lang !== "al-br" && dados_item.description) {
                const traduz_descri = dados_item.description.split("\n")

                for (let k = 0; k < traduz_descri.length; k++) {

                    if (!descricao_tipo.includes("nether_star")) {
                        alvo = traduz_descri[k].split(":")[0]
                        alvo_json = alvo.replaceAll(" ", "_").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
                    } else { // Traduzindo efeitos de poções e flechas
                        alvo = traduz_descri[k].split(" (")[0]
                        alvo_json = alvo.split(" ")[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()

                        if (alvo_json.includes(":"))
                            alvo_json = alvo_json.split(":")[0]

                        nome_item += ` of ${client.tls.phrase(user, `util.minecraft.detalhes.${alvo_json}`)}`
                    }

                    traducao_alvo = client.tls.phrase(user, `util.minecraft.detalhes.${alvo_json}`)
                    valores_item = valores_item.replaceAll(alvo, traducao_alvo)
                }

                fields = { name: descricao_tipo, value: `\`${valores_item}\``, inline: true }
            }

            const embed = new EmbedBuilder()
                .setTitle(dados_item.name)
                .setColor(client.embed_color(user.misc.color))
                .setImage(dados_item.icon)
                .addFields(
                    {
                        name: `${client.emoji("mc_coracao")}** ${client.tls.phrase(user, "util.minecraft.coletavel")}**`,
                        value: `\`${colet_suv}\``,
                        inline: true
                    },
                    {
                        name: `${client.emoji("mc_bamboo_sign")} **${client.tls.phrase(user, "util.minecraft.tipo")}**`,
                        value: `\`${tipo_item}\``,
                        inline: true
                    },
                    {
                        name: `${client.emoji("mc_cyan_goat_horn")} **${client.tls.phrase(user, "util.minecraft.versao_add")}**`,
                        value: `\`${dados_item.stats.version}\``,
                        inline: true
                    }
                )
                .addFields(
                    {
                        name: `${client.emoji("mc_chest")} **${client.tls.phrase(user, "util.minecraft.empilhavel")}**`,
                        value: `\`${empilhavel}\``,
                        inline: true
                    },
                    {
                        name: `${client.emoji("mc_cornflower")} **${client.tls.phrase(user, "util.minecraft.renovavel")}**`,
                        value: `\`${renovavel}\``,
                        inline: true
                    },
                    {
                        name: `${client.emoji("mc_name_tag")} **${client.tls.phrase(user, "util.minecraft.nome_interno")}**`,
                        value: `**\`minecraft:${dados_item.internal_name}\`**`,
                        inline: true
                    }, fields
                )

            if (parseInt(`${dados_item.stats.version}`.split(".")[1]) > 21) {
                nota_rodape = client.tls.phrase(user, "util.minecraft.nota_rodape")

                if (nota_rodape.includes("item_repl"))
                    nota_rodape = client.replace(nota_rodape, pesquisa)

                embed.setFooter({
                    text: nota_rodape
                })
            }

            if (dados_item.durability)
                embed.addFields(
                    { name: "⠀", value: "⠀", inline: true },
                    {
                        name: `${client.emoji("mc_anvil")} **Durabilidade: ${dados_item.durability + 1}**`,
                        value: "⠀",
                        inline: true
                    }
                )

            // Dados vindos da wiki do minecraft
            if (dados_item.wiki.descricao) {
                const link_artigo = client.tls.phrase(user, "util.minecraft.mais_detalhes_wiki", null, dados_item.wiki.link)

                embed.addFields(
                    {
                        name: `${client.emoji("mc_logo_wikipedia")} Wiki sobre ${dados_item.name}`,
                        value: `\`\`\`fix\n${client.execute("formatters", "formata_texto", (dados_item.wiki.descricao.split("\">")[0]).length > 500 ? `${(dados_item.wiki.descricao.split("\">")[0]).slice(0, 500)}...` : dados_item.wiki.descricao.split("\">")[0])}\`\`\`\n${link_artigo}`,
                        inline: false
                    }
                )
            }

            if (interaction)
                return interaction.editReply({
                    embeds: [embed],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            else
                return client.sendDM(user, { embeds: [embed] }, true)
        })
}