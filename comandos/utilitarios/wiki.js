module.exports = {
    name: "wiki",
    description: "Pesquisa sobre algo na wiki",
    aliases: [ "w", "buscar", "busca" ],
    usage: "w slondo",
    cooldown: 3,
    permissions: [ "SEND_MESSAGES" ],
    execute(client, message, args) {

        const fetch = require('node-fetch');
        const { MessageEmbed } = require('discord.js');
        const { emojis_negativos } = require('../../arquivos/json/text/emojis.json');

        let content = '';
        let counter = 0;

        for(let i = 0; i < args.length; i++){
            content += args[i] +' ';
        }

        content = content.toLowerCase();

        if(content.includes("slondo")){
            message.lineReply("Esse vagabundo não tá na wiki, pesquise outra coisa! :sunglasses:");
            return;
        }

        const qtd_emojis_erro = Math.round((emojis_negativos.length - 1) * Math.random());
        let emoji_nao_encontrado = client.emojis.cache.get(emojis_negativos[qtd_emojis_erro]).toString();

        if(args.length > 0){
            content = content.substr(0, (content.length - 1)); // Remove o espaço no último caractere

            const url = 'https://api.duckduckgo.com/?q='+ encodeURI(content) +'&format=json&pretty=0&skip_disambig=1&no_html=1';

            const termo_pesquisado_cc = content.slice(1);
            const username = `${message.author.username}`;

            fetch(url, {headers:{"accept-language": "pt-BR"}})
            .then(response => response.json())
            .then(async res => {
            
            const fields = [];
            
            if(res.RelatedTopics.length > 0)
                fields.push({ name: ":books: Tópicos relacionados", value: "\u200B" });

            for(const topic of res.RelatedTopics){
                counter++;

                let text = topic.Text.substring(0, 100) + "...";

                fields.push({
                    name: text,
                    value: topic.FirstURL,
                    inline: true
                });

                if(counter > 5)
                    break;
            }

            if(res.Heading !== ""){
                fields.length = fields.length > 5 ? 5 : fields.length

                const Embed = new MessageEmbed()
                .setColor(0x29BB8E)
                .setTitle(res.Heading)
                .setAuthor(res.AbstractSource)
                .setDescription(res.AbstractText)
                .setThumbnail(res.Image != '' ? 'https://api.duckduckgo.com'+res.Image : 'https://cdn.iconscout.com/icon/free/png-256/duckduckgo-3-569238.png')
                .addFields(fields)
                .setTimestamp()
                .setFooter('DuckDuckGo API', message.author.avatarURL({dynamic:true}))
                .setURL(res.AbstractURL);

                message.lineReply(Embed);
            }else
                if(username.includes(termo_pesquisado_cc))
                    message.lineReply(emoji_nao_encontrado +" | Pq vc está se pesquisando? Não tem nada sobre vc aq :v");
                else
                    message.lineReply(emoji_nao_encontrado +" | Não encontrei nada relacionado com sua pesquisa [ `" + content +"` ], tente novamente");
            })
            .catch(err => {
                message.lineReply(emoji_nao_encontrado +" | Não encontrei nada relacionado a sua pesquisa [ `" + content +"` ], tente novamente");
            });
        }
    }
};