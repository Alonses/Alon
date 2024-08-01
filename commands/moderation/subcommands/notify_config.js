const { EmbedBuilder, PermissionsBitField } = require('discord.js')
const { updateGuild } = require("../../../core/database/schemas/Guild")

module.exports = async ({ client, user, interaction }) => {

    const guild = await client.getGuild(interaction.guild.id)
    let update = {}

    const dados = {
        role: interaction.options.getRole("role"),
        channel: interaction.options.getChannel("channel"),
        lang: interaction.options.getString("language")
    }

    if (dados.role) {
        dados.role = dados.role.id
        update.games_role = dados.role
    }

    if (dados.channel) {
        // Tipo 0 -> Canal de texto tipo normal
        // Tipo 5 -> Canal de texto tipo anúncios

        if (dados.channel.type !== 0 && dados.channel.type !== 5) // Verificando se o canal mencionado é inválido
            return client.tls.reply(interaction, user, "mode.anuncio.tipo_canal", true, client.defaultEmoji("types"))

        dados.channel = dados.channel.id
        update.games_channel = dados.channel
    }

    if (!guild.lang) {
        update.lang = client.idioma.getLang(interaction)
        dados.lang = update.lang
    }

    if (!dados.lang)
        dados.lang = guild.lang

    const canal_alvo = client.discord.channels.cache.get(guild.games_channel)

    // Verificando permissões para enviar mensagens no canal
    if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal_alvo))
        return client.tls.reply(interaction, user, "mode.anuncio.permissao_envio", true, client.defaultEmoji("guard"))

    const row = client.create_buttons([
        { id: "misc_notify_button", name: client.tls.phrase(user, "menu.botoes.ativar"), type: 0, emoji: client.emoji(20), data: `1|${interaction.guild.id}.${dados.lang}` },
        { id: "misc_notify_button", name: client.tls.phrase(user, "menu.botoes.ativar_anunciando"), type: 2, emoji: client.defaultEmoji("channel"), data: `2|${interaction.guild.id}.${dados.lang}` },
        { id: "misc_notify_button", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(13), data: `0|${interaction.guild.id}` }
    ], interaction)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "mode.anuncio.config_titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.anuncio.config_descricao"))
        .setFields(
            {
                name: `:label: **${client.tls.phrase(user, "mode.anuncio.cargo")}**`,
                value: `( <@&${dados.role}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.canal.canal")}**`,
                value: `( <#${dados.channel}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("translate")} **${client.tls.phrase(user, "mode.anuncio.idioma")} :flag_${dados.lang.slice(3, 5)}:**`,
                value: "⠀",
                inline: true
            }
        )

    await updateGuild(client, guild.id, update)

    interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}