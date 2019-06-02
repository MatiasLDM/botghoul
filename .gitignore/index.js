const Discord = require('discord.js');
const fs = require('fs')
const client = new Discord.Client();
const { Client, RichEmbed } = require('discord.js');
const warns = JSON.parse(fs.readFileSync('./warns.json'))
const ms = require('ms');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('database.json');
const db = low(adapter);

db.defaults({ histoires: [], xp: []}).write()

let prefix = "-"

client.login('NTQ3MDM1MDA4MTIxMDQ1MDI4.XO-k-g.eGPwDt2KxlxO2bUsS7JVDbW6LUw');

/*Bienvenue & Autorole*/
client.on('guildMemberAdd', function (member) {
    let embed = new Discord.RichEmbed()
        .setDescription(member.user.username + ' a rejoint ')
        .setFooter('Nous sommes désormais ' + member.guild.memberCount)
    member.guild.channels.get('583020146377883671').send(embed)
    member.addRole('583024178806915073')
})
 
client.on('guildMemberRemove', function (member) {
    let embed = new Discord.RichEmbed()
        .setDescription(member.user.username + '** a quitté ')
        .setFooter('Nous sommes désormais ' + member.guild.memberCount)
    member.guild.channels.get('583020146377883671').send(embed)
})

/*helpadmin*/
client.on('message', message => {
    if(message.content === '-helpadmin') {
        const embed = new RichEmbed()
        .setColor('#3333CC')
        .setTitle('Toutes les commandes de modérations: \n-kick: exclue la personne \n-ban: exclue la personne pendant 7 jours \n-clear: Efface les messages ')
        .setDescription('Fait -helpadmin2 pour accéder à la page 2');
        message.channel.send(embed);
    }
});

client.on('message', message => {
    if(message.content === '-helpadmin2') {
        const embed = new RichEmbed()
        .setColor('#3333CC')
        .setTitle('Toutes les commandes de modérations page2: \n-mute: empêche la personne de parler jusqu au retrait du garde muted \n-warn: souvegarde un avertissement de quelqu un \n-infractions: Voit toutes les avertissements sauvegarder de une personne')
        message.channel.send(embed);
    }
});

/*Kick*/
client.on('message',message =>{
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLocaleLowerCase() === prefix + 'kick'){
       if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande :x:")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send(":x:Veuillez mentionner un utilisateur :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send(":x:Vous ne pouvez pas kick cet utilisateur :x:")
       if (!member.kickable) return message.channel.send(":x:Je ne peux pas exclure cet utilisateur :x:")
       member.kick()
       message.channel.send("** :white_check_mark:"+member.user.username + '** a été exclu :white_check_mark:')
    }
});
 
/*Ban*/
client.on('message',message =>{
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLocaleLowerCase() === prefix + 'ban'){
       if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande :x:")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send(":x:Veuillez mentionner un utilisateur :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send(":x:Vous ne pouvez pas bannir cet utilisateur :x:")
       if (!member.bannable) return message.channel.send(":x:Je ne peux pas bannir cet utilisateur :x:")
       message.guild.ban(member, {days: 7})
       message.channel.send("** :white_check_mark:"+member.user.username + '** a été banni :white_check_mark:')
    }
});

/*Clear*/
client.on("message", message => {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLowerCase() === prefix + "clear") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande:x:")
        let count = args[1]
        if (!count) return message.channel.send(":x:Veuillez indiquer un nombre de messages à supprimer:x:")
        if (isNaN(count)) return message.channel.send(":x:Veuillez indiquer un nombre valide:x:")
        if (count < 1 || count > 99) return message.channel.send(":x:Veuillez indiquer un nombre entre 1 et 99:x:")
        message.channel.bulkDelete(parseInt(count) + 1)
    }
 
/*Mute*/
    if (args[0].toLowerCase() === prefix + "mute") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande:x:")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send(":x:Membre introuvable:x:")
        if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send(":x:Vous ne pouvez pas mute ce membre:x:")
        if (member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send(":x:Je ne peux pas mute ce membre:x:")
        let muterole = message.guild.roles.find(role => role.name === 'Muted')
        if (muterole) {
            member.addRole(muterole)
            message.channel.send(':white_check_mark:' + member + ' a été mute :white_check_mark:')
        }
        else {
            message.guild.createRole({name: 'Muted', permissions: 0}).then((role) => {
                message.guild.channels.filter(channel => channel.type === 'text').forEach(channel => {
                    channel.overwritePermissions(role, {
                        SEND_MESSAGES: false
                    })
                })
                member.addRole(role)
                message.channel.send(':white_check_mark:' + member + ' a été mute :white_check_mark:')
            })
        }
    }
})

/*Warn*/
client.on("message", message => {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLowerCase() === prefix + "warn") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande:x:")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send(":x:Veuillez mentionner un membre:x:")
        if (member.highestRole.comparePositionTo(message.member.highestRole) < 1 && message.author.id !== message.guild.ownerID) return message.channel.send(":x:Vous ne pouvez pas warn ce membre:x:")
        let reason = args.slice(2).join(' ')
        if (!reason) return message.channel.send(":x:Veuillez indiquer une raison:x:")
        if (!warns[member.id]) {
            warns[member.id] = []
        }
        warns[member.id].unshift({
            reason: reason,
            date: Date.now(),
            mod: message.author.id
        })
        fs.writeFileSync('./warns.json', JSON.stringify(warns))
        message.channel.send(":white_check_mark:" + member + " a été warn pour " + reason + " :white_check_mark:")
    }

/*Infractions*/
if (args[0].toLowerCase() === prefix + "infractions") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(":x:Vous n'avez pas la permission d'utiliser cette commande:x:")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send(":x:Veuillez mentionner un membre:x:")
    let embed = new Discord.RichEmbed()
        .setAuthor(member.user.username, member.user.displayAvatarURL)
        .addField('10 derniers warns', ((warns[member.id]) ? warns[member.id].slice(0, 10).map(e => e.reason) : ":x:Ce membre n'a aucun warns:x:"))
        .setTimestamp()
    message.channel.send(embed)
}
})

module.exports.run = (bot, message, args) => {
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
        return message.channel.send(
            ":x:Vous n'avez pas la permission d'utiliser cette commande:x:"
        );
    let messageToBot = args.join(' ');
    message.delete().catch();
    message.channel.send(messageToBot);
};

/*Commande externe*/

client.on('message', message => {
    if(message.content === '-info') {
        const embed = new RichEmbed()
        .setColor('#990099')
        .setTitle('Pour me rajouter à ton serveur : https://discordapp.com/oauth2/authorize?client_id=547035008121045028&scope=bot&permissions=2146958591%27')
        .setDescription('Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});

client.on('ready', function () {
    console.log("Ghoul a bien été lancé et est prêt a être utilisé !")
    client.user.setActivity('-helpadmin | -info | -fun | -xp ', {type: 'PLAYING'});
})

client.on('message', message => {
    if(message.content === '-fun') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Voici mes commandes Fun :yum: -ping -insulte -blague -enigme -bonjour')
        .setDescription('Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});

client.on('message', message => {
    if(message.content === '-ping') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Pong! :ping_pong:')
        .setDescription('Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});

client.on('message', message => {
    if(message.content === '-insulte') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('TA mère le stroumph en string de guerre , la prochaine fois ne me derange pas pd')
        .setDescription('Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});

client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Pourquoi dit-on que les poissons travaillent illégalement ?')
        .setDescription('Parce qu’ils n’ont pas de FISH de paie.   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Quel est le bar préféré des espagnols ?')
        .setDescription('Le Bar-celone.   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Qu et-ce qu un tennisman adore faire ?')
        .setDescription('Rendre des services!   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-enigme') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('je suis noir, je deviens rouge, et je finis blanc...')
        .setDescription('le charbon!   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-enigme') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Si tu me perds, tu tombes. Qui suis-je ?')
        .setDescription('L équilibre, car lorsqu on perd l équilibre on tombe.   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});

client.on('message', message => {
    if(message.content === '-enigme') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('je suis à la fois carré et ovale, qui suis-je ?')
        .setDescription('Le chiffre zéro : zéro est le carré de zéro (tout comme 4 est le carré de 2) et on le représente par un ovale.   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Quel est le meilleur site pour un homme qui cherche un lave-vaisselle ?')
        .setDescription('Un site de rencontres!   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Pourquoi les Chtis aiment les fins de vacances au camping ?')
        .setDescription('C’est le moment où ils peuvent démonter leur tente   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


client.on('message', message => {
    if(message.content === '-blague') {
        const embed = new RichEmbed()
        .setColor('#ffff00')
        .setTitle('Quel est le point commun entre un homme qui vient de se réveiller et un élastique ?')
        .setDescription('Les deux s’étirent, s’étirent, s’étirent, et pètent.   Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});



client.on('message', message => {
    if(message.content === '-bonjour') {
        const embed = new RichEmbed()
        .setColor('#4000ff')
        .setTitle('Salut mon petit pote que à moi :smiling_imp: ')
        .setDescription('Created by @🅻🅳🅼  MȺŧɨȺs');
        message.channel.send(embed);
    }
});


/*Message Privé*/
client.on('message', async message => {
if(message.content.startsWith(prefix + "mp")) {

    var args = message.content.split(" ").slice(1);
    var msge = args.join(' ');

    if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("❌ Tu n'as pas la permission d'utiliser cette commande!");
    if(!msge) return message.channel.send("Precise un message")

    var mpall = new Discord.RichEmbed()
    .setThumbnail(client.user.avatarURL)
    .setTimestamp()
    .setColor("RANDOM")  
    .addField("PUB/INFO", msge);
    message.delete()
    message.guild.members.map(m => m.send(mpall))
}
})

/*Système d'XP*/
client.on('message', async message => {
   
    var msgauthor = message.author.id
 
    if(message.author.bot)return;
 
    if(!db.get("xp").find({user : msgauthor}).value()){
        db.get("xp").push({user : msgauthor, xp: 1}).write();
    }else{
        var userxpdb = db.get("xp").filter({user : msgauthor}).find("xp").value();
        console.log(userxpdb)
        var userxp = Object.values(userxpdb)
        console.log(userxp)
        console.log(`Nombre d'xp: ${userxp[1]}`)
 
        db.get("xp").find({user: msgauthor}).assign({user: msgauthor, xp: userxp[1] += 1}).write();
 
        if(message.content === prefix + "xp"){
            var xp = db.get("xp").filter({user: msgauthor}).find('xp').value()
            var xpfinal = Object.values(xp);
            var xp_embed = new Discord.RichEmbed()
                .setTitle(`Stat des XP de : ${message.author.username}`)
                .setColor('RANDOM')
                .addField("XP", `${xpfinal[1]} xp`)
                .setFooter("Created by @🅻🅳🅼  MȺŧɨȺs")
            message.channel.send({embed : xp_embed})
        }
    }
})
