const { Command } = require("discord.js-commando")
const { MessageEmbed, Message } = require("discord.js")
const { stripIndent } = require("common-tags")

module.exports = class deleteitem extends Command {
    constructor(client) {
        super(client, {
            name: "deleteitem", 
            description: "Remove an item from the database by name", 
            group: "owner",
            memberName: "deleteitem", 
            aliases: ["de"], 
            args: [{
                type: "string", 
                prompt: "What's the item's name?", 
                key: "name", 
                parse: e => e.toUpperCase()
            }] 
            
        })
    }

    async run(msg, { name }){

        const ITEMS = await this.client.dbs.items.findOne({ DB_ID: process.env.DB_ID })

        if(!ITEMS) return msg.say(`The items database is missing!`).catch(err => console.log(err))

        let itemExist = ITEMS.items.find(i => i.name === name)

        if(!itemExist) return msg.say(new MessageEmbed()
        .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
        .setTitle(`Couldn't find an item named ${name} in the database!`)
        .setColor("RED")
        .setTimestamp()
        .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))).catch(err => console.log(err))

        ITEMS.items = ITEMS.items.filter(i => i.name !== name)
        ITEMS.save().catch(err => console.log(err))

        return msg.say(new MessageEmbed()
        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))
        .setTitle(`${name} has been deleted from the database`)
        .setColor("GREEN")
        .setTimestamp()).catch(err => console.log(err))


        
    }

}