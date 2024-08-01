const { languagesMap } = require("../../../core/formatters/patterns/user")
const {updateGuild} = require("../../../core/database/schemas/Guild");

module.exports = async ({ client, user, interaction }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = { }
    let novo_idioma = interaction.options.getString("language")
    let frase_retorno

    if (novo_idioma === "pt-hp") { // Hopês
        if (!guild.second_lang) { // Definindo um idioma secundário
            update.second_lang = "pt-hp"
            frase_retorno = languagesMap["hp"][1]
        } else { // Removendo o idioma secundário
            update.second_lang = null
            frase_retorno = client.tls.phrase(user, "mode.idiomas.idioma_secundario_removido", 11)
        }
    } else { // Realizando a alteração de idioma do servidor
        update.lang = novo_idioma
        frase_retorno = `:flag_${novo_idioma.slice(3, 5)}: | ${client.tls.phrase(user, "mode.idiomas.idioma_server")} \`${client.tls.phrase(user, `mode.idiomas.siglas.${novo_idioma}`)}\``
    }

    await updateGuild(client, guild.id, update)

    interaction.reply({
        content: frase_retorno,
        ephemeral: true
    })
}