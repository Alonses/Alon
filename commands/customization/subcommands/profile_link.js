module.exports = async ({ client, interaction }) => {

    // Redirecionando para a opção respectiva
    require(`./endpoints/link_${interaction.options.getString("platform")}`)({ client, interaction })
}