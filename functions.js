const { PermissionsBitField, ChannelType } = require('discord.js')

const { readdirSync } = require('fs')

const { alea_hex } = require('./core/functions/hex_color')

const { getBot, updateBot } = require('./core/database/schemas/Bot')
const { getUser } = require('./core/database/schemas/User')

const { create_menus } = require('./core/generators/menus')
const { create_profile } = require('./core/generators/profile')
const { create_buttons } = require('./core/generators/buttons')

const { registryStatement } = require('./core/database/schemas/User_statements')
const { createBadge, getUserBadges } = require('./core/database/schemas/User_badges')
const { getGuild, getNetworkedGuilds } = require('./core/database/schemas/Guild')

const { aliases, default_emoji, emojis_dancantes, emojis_negativos } = require('./files/json/text/emojis.json')

const { busca_badges } = require('./core/data/user_badges')

const network = require('./core/events/network')
const translate = require('./core/formatters/translate')
const menu_navigation = require('./core/functions/menu_navigation')

const { listAllGuildWarns } = require('./core/database/schemas/Guild_warns')
const { checkUserGuildWarned, listAllUserWarns } = require('./core/database/schemas/User_warns')
const { registerUserGuild, listAllUserGuilds } = require('./core/database/schemas/User_guilds')

const { loggerMap } = require('./core/formatters/patterns/guild')
const { spamTimeoutMap, defaultRoleTimes } = require('./core/formatters/patterns/timeout')
const { badgeTypes, languagesMap } = require('./core/formatters/patterns/user')
const { checkUserGuildPreWarned } = require('./core/database/schemas/User_pre_warns')
const {data} = require("./commands/games/gta");

function internal_functions(client) {

    console.log("🟠 | Inicializando o bot...")
    console.log("🟠 | Vinculando as funções internas")

    client.error = async (err, local) => { require("./core/events/error")(client, err, local) }

    client.atualiza_dados = async (alvo, interaction) => {
        if (!alvo.sid) {
            alvo.sid = interaction.guild.id
            await alvo.save()
        }
    }

    // Apagando os convites criados pelo usuário que foi expulso/banido do servidor
    client.checkUserInvites = async (guild, id_user) => {

        // Removendo o cargo ao usuário que recebeu a advertência
        if (!await client.permissions(guild.sid, client.id(), [PermissionsBitField.Flags.ManageGuild]))
            return client.notify(guild.logger.channel, { content: client.tls.phrase(guild, "mode.invites.sem_permissao_2", 7) })

        // Excluindo os convites que o membro expulso/banido criou
        const cached_guild = await client.guilds(guild.sid)
        cached_guild.invites.fetch().then(invites => {

            let convites = 0

            invites.each(i => {
                if (i.inviterId === id_user) {
                    i.delete()
                    convites++
                }
            })

            if (convites > 0) { // Enviando a notificação de convites rastreados excluídos
                const convites_formatado = `${convites} ${convites > 1 ? client.tls.phrase(guild, "mode.invites.convites") : client.tls.phrase(guild, "mode.invites.convite")}`
                client.notify(guild.logger.channel, { content: client.tls.phrase(guild, "mode.invites.exclusao", 44, convites_formatado) })
            }
        })
    }

    // Retorna a quantidade de arquivos com determinada extensão na url especificada
    client.countFiles = (caminho, extensao) => { return readdirSync(caminho).filter(file => file.endsWith(extensao)).length }

    client.create_buttons = (data, interaction) => { return create_buttons(data, interaction) }

    client.create_menus = ({ client, interaction, user, data, pagina, multi_select, guild }) => {
        return create_menus({ client, interaction, user, data, pagina, multi_select, guild })
    }

    client.create_profile = ({ interaction, user, id_alvo }) => { return create_profile(client, interaction, user, id_alvo) }

    // Verifica se um valor foi passado, caso contrário retorna o valor padrão esperado
    client.decider = (entrada, padrao) => { return !entrada ? padrao : entrada }

    client.defaultEmoji = (caso) => { return default_emoji[caso][client.random(default_emoji[caso])] }

    client.deferedResponse = async ({ interaction, ephemeral }) => {

        let ephemero = typeof ephemeral !== "undefined" ? ephemeral : true

        if (!interaction.customId) await interaction.deferReply({ ephemeral: ephemero })
        else await interaction.deferUpdate({ ephemeral: ephemero })
    }

    client.embed_color = (entrada) => {

        if (entrada === "RANDOM") return alea_hex()

        return entrada.slice(-6)
    }

    client.emoji = (dados) => {

        let id_emoji = dados

        if (typeof dados === "object") // Escolhendo um emoji do Array com vários emojis
            if (dados[0].length > 15) dados = id_emoji[client.random(dados)]

        // Emojis customizados
        if (isNaN(parseInt(dados))) { // Emoji por nome próprio do JSON de emojis

            if (dados == "emojis_dancantes") dados = emojis_dancantes[client.random(emojis_dancantes)]
            else if (dados == "emojis_negativos") dados = emojis_negativos[client.random(emojis_negativos)]
            else dados = aliases[dados]

            return client.formatEmoji(dados, client.discord.emojis.cache.get(dados))

        } else
            if (dados.length > 15) return client.formatEmoji(dados, client.discord.emojis.cache.get(dados)) // Emoji por ID
            else return translate.get_emoji(dados) // Emoji padrão por código interno
    }

    client.formatEmoji = (id, emoji) => {

        if (!id || !emoji) return ":epic_embed_fail:"

        const formatado = `<:${emoji.name}:${id}>`

        return emoji.animated ? formatado.replace("<:", "<a:") : formatado
    }

    client.execute = (folder, funcao, data) => { // Executa funções dinâmicas utilizando os dados fornecidos

        if (!funcao.includes(".")) return require(`./core/${folder}/${funcao}`)(data)
        else return require(`./core/${folder}/${funcao.split(".")[0]}`)[funcao.split(".")[1]](data)
    }

    client.extractSuspiciousLink = (text) => { // Extrai os links formatados do texto original

        const links = []
        text = text.split("(")
        text.shift()

        for (let i = 0; i < text.length; i++) links.push(text[i].split(")")[0])

        return links
    }

    // Funcoes do banco de dados
    client.getBot = () => getBot(client)

    client.updateBot = (data) => updateBot(client, data)


    client.getGuild = (id_guild) => getGuild(client, id_guild)

    client.getGuildChannels = async (interaction, user, tipo, id_configurado) => { // Lista todos os canais de um tipo especifico no servidor

        const canais = interaction.guild.channels.cache.filter(c => c.type === tipo)
        const canais_alvo = []

        if (!id_configurado) id_configurado = ""

        canais.map(channel => {
            if (channel.id !== id_configurado && channel.id !== interaction.channel.id && channel.id !== interaction.channel.parentId)
                canais_alvo.push({ id: channel.id, name: channel.name })
        })

        // Ordenando alfabeticamente os canais
        const ordenado = canais_alvo.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))

        if (id_configurado !== interaction.channel.id && id_configurado !== interaction.channel.parentId) { // Adicionando o local atual do comando no inicio do array

            if (tipo === ChannelType.GuildText) // Usado por canais
                ordenado.unshift({ id: interaction.channel.id, name: client.tls.phrase(user, "menu.botoes.local_atual"), emoji: "🎯" })
            else if (interaction.channel.parentId) // Usado por categorias
                ordenado.unshift({ id: interaction.channel.parentId, name: client.tls.phrase(user, "menu.botoes.local_atual"), emoji: "🎯" })
        }

        return ordenado
    }

    client.getGuildRole = (interaction, id_cargo) => {

        // Retorna o cargo solicitado
        return interaction.guild.roles.cache.find((r) => r.id === id_cargo)
    }

    client.getGuildRoles = async (interaction, id_atual, permitir_mods) => {
        const roles = []
        const id_ignorar = id_atual || null

        interaction.guild.roles.cache.forEach(role => {
            if (role.id !== interaction.guild.id && role.id !== id_ignorar && role.editable) { // Adiciona apenas cargos customizados

                // Não inclui cargos que possuem permissões moderativas
                if ((!role.permissions.has(PermissionsBitField.Flags.ManageMessages) && !role.permissions.has(PermissionsBitField.Flags.ModerateMembers) && !role.permissions.has(PermissionsBitField.Flags.Administrator)) || permitir_mods)
                    roles.push({ id: role.id, name: role.name })
            }
        })

        // Ordenando alfabeticamente os cargos
        return roles.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))
    }

    client.getUser = (id_user) => { return getUser(id_user) }

    client.getUserBadges = (id_user) => { return getUserBadges(id_user) }

    // Retorna o membro do servidor
    client.getMemberGuild = async (interaction, id_alvo) => {

        let membro

        if (interaction.guild) // Coletando a partir de uma interação ou evento
            membro = interaction.guild.members.fetch(id_alvo)
                .catch(() => { return null })
        else if (interaction.members)// Coletando direto da guild
            membro = interaction.members.fetch(id_alvo)
                .catch(() => { return null })
        else {
            // Procurando a guild e o membro usando um ID do servidor
            const guild = await client.guilds(interaction)

            if (guild)
                membro = guild.members.fetch(id_alvo)
                    .catch(() => { return null })
        }

        return membro
    }

    client.getMemberGuildsByPermissions = async ({ interaction, user, permissions }) => {

        const guilds_user = []
        let servidores = await listAllUserGuilds(user.uid)

        if (servidores.length < 1) // Membro não possui servidores salvos em cache
            servidores = await client.guilds()

        for await (let server of servidores) {

            const guild = server.sid ? await client.guilds(server.sid) : server[1]

            if (guild?.id) // verificando se o servidor possui os dados corretos
                if (guild.id !== interaction.guild.id) {
                    const membro_guild = await guild.members.fetch(user.uid)
                        .catch(() => { return null })

                    if (membro_guild) { // Listando as guilds que o usuário é moderador
                        if (membro_guild.permissions.has(permissions)) {
                            const internal_guild = await client.getGuild(guild.id)
                            internal_guild.name = guild.name

                            guilds_user.push(internal_guild)
                        }

                        // Registrando os servidores que o usuário faz parte
                        registerUserGuild(user.uid, guild.id)
                    }
                }
        }

        // Ordenando alfabeticamente os servidores
        return guilds_user.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))
    }

    // Busca pelo usuário em cache
    client.getCachedUser = (id_alvo) => { return client.discord.users.fetch(id_alvo) }

    client.getSingleWarnedGuildUser = async (id_guild, escopo) => {

        const warned_users = await (escopo === "warn" ? checkUserGuildWarned(id_guild) : checkUserGuildPreWarned(id_guild)), usuarios_validos = []
        let warned_cache = []

        for (let i = 0; i < warned_users.length; i++)
            if (!warned_cache.includes(warned_users[i].uid)) {
                warned_cache.push(warned_users[i].uid)
                usuarios_validos.push(warned_users[i])
            }

        return usuarios_validos
    }

    client.guildAction = (warn, chave_traduz) => {

        // Verifica se a ação do servidor é silenciar um membro, caso positivo, retorna o tempo de mute do servidor
        return warn.action === "member_mute" ? `\n${client.defaultEmoji("time")} **${client.tls.phrase(chave_traduz, "mode.spam.tempo")}:** \`${client.tls.phrase(chave_traduz, `menu.times.${spamTimeoutMap[warn.timeout]}`)}\`` : ""
    }

    // Registra os eventos no diário do bot
    client.journal = async (caso, quantia) => { require('./core/auto/edit_journal')({ client, caso, quantia }) }

    // Cria uma lista com vírgulas e & no último elemento
    client.list = (valores, tamanho_maximo) => {

        let lista = ""

        if (valores.length > 1) {
            for (let i = 0; i < valores.length; i++) {
                if (!valores[i + 1]) lista += " & "

                lista += `\`${valores[i]}\``

                if (valores[i + 2]) lista += ", "
            }
        } else // Apenas um elemento
            lista += `\`${valores[0]}\``

        if (tamanho_maximo)
            if (lista.length > tamanho_maximo) lista = `${lista.slice(0, tamanho_maximo)}...`

        return lista
    }

    client.listLanguages = (language) => {

        const idiomas = []

        Object.keys(languagesMap).forEach(lang => {
            if (lang !== language.slice(0, 2)) idiomas.push(lang)
        })

        return idiomas
    }

    // Converte o valor numério para um formato específico
    client.locale = (valor, locale) => {

        if (!locale) locale = "pt-br"

        return valor.toLocaleString(locale)
    }

    client.menu_navigation = (user, data, pagina) => {
        return menu_navigation(client, user, data, pagina)
    }

    // Sincroniza as ações moderativas em servidores com o network habilitado
    client.network = async (guild, caso, id_alvo) => { return network({ client, guild, caso, id_alvo }) }

    client.getNetWorkGuildNames = async (user, link, interaction) => {

        const servers_link = []

        let servers_cache = await getNetworkedGuilds(client, link)
        for (let i = 0; i < servers_cache.length; i++) {
            if (servers_cache[i].sid !== interaction.guild.id) {
                const nome_servidor = (await client.guilds(servers_cache[i].sid))?.name || client.tls.phrase(user, "menu.invalid.servidor_desconhecido")
                servers_link.push(`\`${nome_servidor}\``)
            }
        }

        return client.list(servers_link, 500)
    }

    // Remove emojis e caracteres especiais da string
    client.normalizeString = (string) => {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\p{P}\p{Z}{^$=+±\\'|`\\~<>}]/gu, "")
    }

    // Envia uma notificação em um canal
    client.notify = async (id_alvo, conteudo) => {

        if (!id_alvo) return

        const canal = await client.discord.channels.cache.get(id_alvo)
        if (!canal) return

        // Verificando se o bot possui permissões para enviar mensagens ou ver o canal
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal)) return

        canal.send(conteudo)
    }

    client.permissions = async (interaction, id_alvo, permissao, canal) => {

        if (interaction) {
            // Permissões do usuário no servidor
            const membro_sv = await client.getMemberGuild(interaction, id_alvo)

            if (!membro_sv) return false // Membro não localizado

            // Verificando se o usuário possui a permissão
            if (membro_sv.permissions.has(permissao)) return true
        } else // Permissões em canais específicos
            if (canal.channel) {
                if (canal.channel.permissionsFor(id_alvo).has(permissao)) return true
            } else if (canal.permissionsFor(id_alvo)?.has(permissao)) return true

        return false
    }

    // Retorna um valor aleatório
    client.random = (intervalo, base) => {
        if (typeof base === "undefined") base = 0 // Valor minimo aceitável

        if (typeof intervalo === "object") intervalo = intervalo.length - 1 // Recebendo um array de dados

        return base + Math.round(intervalo * Math.random())
    }

    client.registryBadge = async (user, id_badge) => {

        const all_badges = [], badges_user = await getUserBadges(user.uid)

        // Listando todas as badges que o usuário possui
        if (badges_user.length > 0)
            badges_user.forEach(valor => { all_badges.push(parseInt(valor.badge)) })

        if (!all_badges.includes(id_badge)) {

            // Atribuindo a badge reporter ao usuário
            await createBadge(user.uid, id_badge, client.timestamp())
            const badge = busca_badges(client, badgeTypes.SINGLE, id_badge)

            client.sendDM(user, { content: client.tls.phrase(user, "dive.badges.new_badge", client.emoji("emojis_dancantes"), [badge.name, badge.emoji]) })
        }
    }

    // Registra a experiência recebida pelo membro
    client.registryExperience = (message, caso) => {

        if (!client.x.ranking) return

        require('./core/data/user_ranking')({ client, message, caso })
    }

    // Registra uma movimentação bancária do usuário
    client.registryStatement = (user, traducao, caso, valor) => { return registryStatement(client, user, traducao, caso, valor) }

    // Substitui partes do texto por outros valores
    client.replace = (string, valores, especifico) => {

        if (!especifico) {
            if (valores && typeof valores === "object") { // Array com vários dados para alterar
                if (valores.length > 0)
                    while (valores.length > 0) {
                        string = string.replace("auto_repl", valores[0])
                        valores.shift()
                    }
                else // Recebendo um objeto diferente de array
                    string = string.replace("auto_repl", valores)

            } else // Apenas um valor para substituição
                string = string.replaceAll("auto_repl", valores)
        } else
            string = string.replaceAll(especifico[0], especifico[1])

        return string
    }

    client.reply = (interaction, obj, defered) => {

        // Interação deferida
        if (defered) return interaction.editReply(obj)

        // Respondendo as interações
        if (interaction.customId) return interaction.update(obj)
        else return interaction.reply(obj)
    }

    client.rolePermissions = async (interaction, role_id, permissions) => {

        const cached_role = client.getGuildRole(interaction, role_id)

        // Verificando as permissões do cargo informado
        for (let i = 0; i < permissions.length; i++)
            if (cached_role.permissions.has(permissions[i])) return false

        // Cargo everyone ou cargo proprietário do discord selecionado
        if (cached_role.id === interaction.guild.id || !cached_role.editable) return false

        return true
    }

    client.hasRole = async (interaction, role_id, user_id) => {

        const user_member = await client.getMemberGuild(interaction.guild.id, user_id)
        if (user_member.roles.cache.has(role_id)) return true
        return false
    }

    // Envia uma notificação em DM para o usuário
    client.sendDM = async (user, dados, force) => {

        let notifications = false

        // Previne que o bot envie DM's para si mesmo
        if (user.uid === client.id()) return
        if (force) user.conf.notify = 1

        // Notificando o usuário alvo caso ele receba notificações em DM do bot
        if (client.decider(user?.conf?.notify, 1)) {

            const user_interno = await client.discord.users.fetch(user.uid)
                .catch(() => { return null })

            if (user_interno)
                user_interno.send(dados) // Enviando conteúdo na DM do usuário
                    .catch(() => notifications = 1)
        }

        // Usuário com DM bloqueada
        if (notifications) {
            user.conf.notify = false
            user.save()
        }
    }

    // Aleatoriza o texto de entrada
    client.shuffleArray = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
        }

        return arr
    }

    client.switcher = ({ guild, operations, operacao }) => {

        // Inverte o valor de botões liga/desliga
        const local = (operations[operacao].action).replaceAll('.', '_')

        guild[local] = !guild[local];

        const pagina_guia = operations[operacao].page

        return { guild, pagina_guia }
    }

    client.timed_message = async (interaction, message, time) => {

        const canal = await client.discord.channels.cache.get(interaction.channel.id)
        if (!canal) return

        // Verificando se o bot possui permissões para enviar mensagens ou ver o canal
        if (!await client.permissions(null, client.id(), [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], canal)) return

        canal.send(message) // Envia a mensagem e apaga a mesma após um tempo
            .then(m => setTimeout(() => { m.delete().catch(() => console.error) }, (time - 1) * 1000))
    }

    client.timestamp = (entrada, hora_entrada) => {

        if (entrada || hora_entrada) { // Informou um dia e horário ( utilizado pelos anúncios de games )

            let tempo_timestamped

            // Invertendo o mês com o dia
            if (entrada.includes("/")) {
                entrada = `${entrada.split("/")[1]}/${entrada.split("/")[0]}`

                let hora = hora_entrada || ""

                const ano_atual = new Date().getFullYear()
                tempo_timestamped = new Date(`${entrada}/${ano_atual} ${hora}`)

                if (entrada.split("/")[0] < 2 && new Date().getMonth() >= 8)
                    tempo_timestamped = new Date(`${entrada}/${ano_atual + 1}`)
            } else
                tempo_timestamped = new Date(entrada) // Entrada de string bruta com padrão utilizado pelo Discord

            // Retorna o dia e o horário informado em timestamp
            return Math.floor(tempo_timestamped.getTime() / 1000)
        }

        return Math.floor(new Date().getTime() / 1000)
    }

    client.user_title = (user, escopo, chave_traducao, emoji_padrao) => {

        // Retorna o texto formatado para membros e bots (usado em cards do log de eventos)
        return `${user.bot ? client.emoji("icon_integration") : emoji_padrao ? emoji_padrao : client.defaultEmoji("person")} **${client.tls.phrase(escopo, chave_traducao)}${user.bot ? ` ( ${user.id !== client.id() ? client.tls.phrase(escopo, "util.user.bot") : client.tls.phrase(escopo, "util.user.alonsal")} )` : ""}**`
    }

    client.verifyAction = (obj, traduz) => {

        // Listando as penalidades que o usuário receberá com a advertência
        let acao_advertencia = `${loggerMap[obj.action] || loggerMap["none"]} \`${client.tls.phrase(traduz, `menu.events.${obj.action || "none"}`)}\`${client.guildAction(obj, traduz)}`

        if (obj.role) // Advertência com cargo aplicado
            acao_advertencia += `\n:label: <@&${obj.role}>${obj.timed_role.status ? ` ( \`${client.defaultEmoji("time")} ${client.tls.phrase(traduz, `menu.times.${defaultRoleTimes[obj.timed_role.timeout]}`)}\` )` : ""}`

        return acao_advertencia
    }

    client.verifyMatrixIndex = (guild_config) => {

        let indice_matriz

        guild_config.forEach(config => {
            if ((config.action === "member_kick_2" || config.action === "member_ban") && !indice_matriz)
                indice_matriz = config.rank + 1
        })

        return indice_matriz || guild_config.length
    }

    // Salva todos os servidores que um usuário esta em cache
    client.verifyUserGuilds = async (user, id_alvo, interaction) => {

        const servidores = await client.guilds()
        let qtd_servidores = 0

        for await (let server of servidores) {

            const guild = server[1]
            const membro_guild = await guild.members.fetch(id_alvo)
                .catch(() => { return null })

            if (membro_guild) { // Registrando os servidores que o usuário faz parte
                registerUserGuild(id_alvo, guild.id)
                qtd_servidores++
            }
        }

        if (interaction)
            interaction.editReply({
                content: client.tls.phrase(user, "manu.data.salvos_cache", 61, qtd_servidores),
                ephemeral: true
            })
    }

    // Updates the user's default language if they do not have one
    client.verifyUserLanguage = async (user, id_guild) => {

        const guild = await client.getGuild(id_guild)
        user.lang = guild.lang || "pt-br"
        await user.save()
    }

    // Valida se o usuário possui ranking ativo
    client.verifyUserRanking = async (id_user) => {

        let user = await client.getUser(id_user)
        let user_ranking = true

        if (typeof user.conf.ranking !== "undefined") user_ranking = user.conf.ranking

        return user_ranking
    }

    // Verificando as advertências do usuário e os cargos 
    client.verifyUserWarnRoles = async (id_user, id_guild) => {

        const guild = await client.guilds(id_guild)
        const guild_warns = await listAllGuildWarns(id_guild)
        const user_warns = await listAllUserWarns(id_user, id_guild)

        let i = 0

        guild_warns.forEach(async guild_warn => {

            if (guild_warn.role) {

                // Permissões do bot no servidor
                const membro_sv = await client.getMemberGuild(id_guild, client.id())
                const membro_guild = await client.getMemberGuild(id_guild, id_user)

                if (!membro_sv || !membro_guild) return // Sem dados

                // Removendo o cargo ao usuário que recebeu a advertência
                if (membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.Administrator)) {
                    if (i >= user_warns.length || user_warns.length === 0) {

                        let role = guild.roles.cache.get(guild_warn.role)

                        if (role.editable) // Verificando se o cargo é editável
                            membro_guild.roles.remove(role).catch(console.error)
                    }
                }
            }

            i++
        })
    }

    console.log(`🟢 | Funções internas vinculadas com sucesso.`)
}

module.exports.internal_functions = internal_functions