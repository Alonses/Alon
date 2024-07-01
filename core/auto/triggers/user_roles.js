const { writeFileSync, readFile } = require('fs')

const { listAllUserValidyRoles, dropUserTimedRole } = require('../../database/schemas/User_roles')

async function atualiza_roles() {

    const dados = await listAllUserValidyRoles()

    // Salvando os cargos temporários no cache do bot
    writeFileSync("./files/data/user_timed_roles.txt", JSON.stringify(dados))
}

async function verifica_roles(client) {

    readFile('./files/data/user_timed_roles.txt', 'utf8', async (err, data) => {
        // Interrompe a operação caso não haja cargos salvos em cache
        if (err || data === undefined || data.length < 1) return

        data = JSON.parse(data)

        for (let i = 0; i < data.length; i++) {

            const role = data[i]

            // Verificando se o cargo ultrapassou o tempo de exclusão
            if (client.timestamp() > role.timestamp) {

                // Excluindo o vinculo do cargo com o membro
                await dropUserTimedRole(role.uid, role.sid, role.rid)

                // Removendo o cargo temporário do membro no servidor
                const guild = await client.guilds(role.sid)
                if (!guild) return

                const cached_role = guild.roles.cache.get(role.rid)
                const membro_guild = await client.getMemberGuild(role.sid, role.uid)

                if (cached_role && membro_guild)
                    membro_guild.roles.remove(cached_role).catch(console.error)
            }
        }

        // Atualizando os cargos em cache
        atualiza_roles()
    })
}

module.exports.atualiza_roles = atualiza_roles
module.exports.verifica_roles = verifica_roles