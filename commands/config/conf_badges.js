const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')

const { busca_badges } = require('../../core/data/user_badges')
const { badgeTypes } = require('../../core/formatters/patterns/user')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_badge")
        .setDescription("⌠🤖⌡ Conceder badge a um usuário")
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("O usuário alvo")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("badge")
                .setDescription("A badge que será atribuida")
                .addChoices(
                    { name: 'Tester', value: '0' },
                    { name: 'Debugger', value: '1' },
                    { name: 'Programmer', value: '2' },
                    { name: 'Creator', value: '3' },
                    { name: 'Waxed', value: '4' },
                    { name: 'Donater', value: '5' },
                    { name: 'Puler', value: '6' },
                    { name: 'Rosquer', value: '7' },
                    { name: 'Pionner', value: '8' },
                    { name: 'Reporter', value: '10' },
                    { name: 'Sugestor', value: '13' }
                )
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { misc: true })
        if (!client.x.owners.includes(interaction.user.id)) return

        let id_alvo = interaction.options.getUser("usuario").id
        let badge_alvo = parseInt(interaction.options.getString("badge"))

        const all_badges = [], badges_user = await client.getUserBadges(id_alvo)

        // Listando todas as badges que o usuário possui
        if (badges_user.length > 0)
            badges_user.forEach(valor => {
                all_badges.push(parseInt(valor.badge))
            })

        // Atribuindo uma nova badge ao usuário
        if (!all_badges.includes(badge_alvo)) {

            const badge = busca_badges(client, badgeTypes.SINGLE, parseInt(badge_alvo))

            const embed = new EmbedBuilder()
                .setTitle("> Conceder Badge")
                .setColor(client.embed_color(user.misc.color))
                .addFields(
                    {
                        name: `${client.defaultEmoji("person")} **Destinatário**`,
                        value: `<@${id_alvo}>`,
                        inline: true
                    },
                    {
                        name: ":label: **Badge**",
                        value: `${badge.emoji} \`${badge.name}\``,
                        inline: true
                    },
                    {
                        name: `${client.defaultEmoji("time")} **Aplicação**`,
                        value: `<t:${client.timestamp()}:f>`,
                        inline: true
                    }
                )
                .setFooter({
                    text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
                    iconURL: interaction.user.avatarURL({ dynamic: true })
                })

            // Criando os botões para o menu de badges
            const row = client.create_buttons([
                { id: "misc_badges", name: client.tls.phrase(user, "menu.botoes.confirmar_notificando"), type: 2, emoji: client.emoji(6), data: `1|${id_alvo}.${badge_alvo}` },
                { id: "misc_badges", name: client.tls.phrase(user, "menu.botoes.apenas_confirmar"), type: 1, emoji: client.emoji(31), data: `2|${id_alvo}.${badge_alvo}` },
                { id: "misc_badges", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: 0 }
            ], interaction)

            return interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            })
        } else
            interaction.reply({
                content: `:octagonal_sign: | O usuário <@!${id_alvo}> já possui a Badge mencionada!`,
                ephemeral: true
            })
    }
}