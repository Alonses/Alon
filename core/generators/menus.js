const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

function create_menus({ client, interaction, user, data, pagina, multi_select, guild }) {

    // Menu sem dados para listar
    const disabled = data.values.length < 1 ? true : false
    const itens_menu = [], alvo = data.alvo

    let insersoes = [], i = 0, indice_start = pagina * 24 || 0

    // Acrescenta um indice para evitar duplicatas
    if (pagina > 0) indice_start++

    // Retorna para exibir mais dados em casos onde só há um item para escolher
    if (pagina > 0 && indice_start - data.values.length < 3) indice_start -= 2

    // Percorrendo as entradas informadas
    if (data.values.length > 0)
        for (let x = indice_start; x < data.values.length; x++) {

            const valor = data.values[x]

            // Montando a lista de valores para escolher conforme o alvo de entrada
            if (!insersoes.includes(valor)) {

                let { nome_label, emoji_label, descricao_label, valor_label } = require(`../formatters/menus/${data.pattern}`)({ client, user, alvo, valor, data, pagina, i })

                itens_menu.push({
                    label: nome_label,
                    emoji: emoji_label,
                    description: descricao_label,
                    value: valor_label
                })

                i++
                insersoes.push(valor)
            }

            if (x == (24 + indice_start)) break
        }
    else
        itens_menu.push({
            label: "Não há nada neste campo!",
            emoji: "🛑",
            description: "Você acessou um recurso, mas não tem nada aqui...",
            value: "invalid"
        })

    // Definindo titulos e ID's exclusivos para diferentes comandos
    let titulo_menu = data.title.tls.split(".").length > 2 ? client.tls.phrase(user, data.title.tls) : data.title.tls
    let id_menu = `select_${alvo}_${interaction.user.id}`
    let min = 1, max = 1

    if (disabled) titulo_menu = `${client.emoji(1)} ${client.tls.phrase(user, `menu.invalid.${alvo.split("#")[1]}`)} 👀`

    // Menu com multi-seleção
    if (multi_select) max = data.values.length - indice_start > 25 ? 25 : data.values.length - indice_start

    // Limitando a quantidade de cargos a serem concedidos/ignorados de forma automática
    if (alvo.includes("role_assigner_")) max = 3

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(id_menu)
                .setPlaceholder(titulo_menu)
                .addOptions(itens_menu)
                .setMinValues(min)
                .setMaxValues(max)
                .setDisabled(disabled)
        )

    return row
}

module.exports.create_menus = create_menus