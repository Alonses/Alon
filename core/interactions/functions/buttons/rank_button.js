const { getRankGlobal } = require('../../../database/schemas/User_rank_global')
const { getRankServer } = require('../../../database/schemas/User_rank_guild')

module.exports = async ({ client, user, interaction, dados, autor_original }) => {

    let defer = false, pagina_guia = parseInt(dados.split(".")[2])
    const operacao = parseInt(dados.split(".")[1])
    const caso = dados.split(".")[3]

    // ID de operações
    // 1 -> Voltar para a página inicial
    // 2 -> Voltar uma página
    // 3 -> Mostrar usuário no ranking
    // 4 -> Próxima página
    // 5 -> Ir para a última página

    if (operacao === 1) pagina_guia = 1
    else if (operacao === 2) pagina_guia--
    else if (operacao === 4) pagina_guia++

    if (operacao === 3 || operacao === 5 || !autor_original) {
        defer = true

        let ephemeral = true

        if (autor_original) ephemeral = client.decider(user?.conf.ghost_mode, 0)

        await client.deferedResponse({ interaction, ephemeral })
    }

    if (operacao === 3 || operacao === 5) {

        // Coletando os dados para o servidor ou para o global
        const data_usuarios = await (caso === "server" ? getRankServer(client, interaction.guild.id) : getRankGlobal(client))
        let posicao = 1

        if (operacao === 3) {

            for (let i = 0; i < data_usuarios.length; i++) {
                if (interaction.user.id !== data_usuarios[i].user_id) posicao++
                else break
            }

            if (posicao > data_usuarios.length)
                posicao = 1

            // Arredonda para cima a página com o usuário
            pagina_guia = Math.ceil(posicao / 6)
        } else pagina_guia = Math.ceil(data_usuarios.length / 6)
    }

    await require('../../../formatters/chunks/model_rank')({
        client,
        user,
        interaction,
        pagina_guia,
        caso,
        defer,
        autor_original
    })
}