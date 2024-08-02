module.exports = async (client, user) => {

    let idioma_definido = user.lang ?? "pt-br"
    if (idioma_definido === "al-br") idioma_definido = "pt-br"

    let horario = new Date(), frase
    horario = horario.getHours()

    if (horario > 6 && horario < 12) // Manhã
        frase = client.tls.phrase(user, "modu.frases.manha")
    else if (horario > 12 && horario < 18) // Tarde
        frase = client.tls.phrase(user, "modu.frases.tarde")
    else
        frase = client.tls.phrase(user, "modu.frases.noite")

    client.sendDM(user.id, { content: frase }, true)
}