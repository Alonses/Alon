const { operations } = require('../../../formatters/patterns/user')

module.exports = async ({ client, interaction, dados }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    const escolha = parseInt(dados.split(".")[1])
    let pagina_guia = 0

    // Tratamento dos cliques
    // 0 -> Modo fantasma
    // 1 -> Notificações em DM
    // 2 -> Ranking do usuário

    // 3 -> Badges públicas
    // 4 -> Clima resumido
    // 5 -> Tarefas globais

    // 6 -> Modo compacto
    // 7 -> Servidores conhecidos

    // Ativa ou desativa a operação selecionada
    const relation = operations[escolha][0]
    const property = operations[escolha][1]
    const value = !user[relation][property]

    switch (relation) {
        case "conf":
            await client.prisma.userOptionsConf.update({
                where: { id: user.conf_id },
                data: JSON.parse(`{ "${property}": ${value} }`)
            })
            break;
        case "misc":
            await client.prisma.userOptionsMisc.update({
                where: { id: user.misc_id },
                data: JSON.parse(`{ "${property}": ${value} }`)
            })
            break
    }

    if (escolha > 2) pagina_guia = 1
    if (escolha > 5) pagina_guia = 2

    await require('../../chunks/panel_personal')({client, interaction, pagina_guia})
}