const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")

module.exports = class edit extends Command { 
    constructor(client){
        super(client, {
            name: "edit", 
            description: "Edit an item's properties", 
            memberName: "edit", 
            group: "owner", 
            ownerOnly: true, 
            args: [{
                type: "string", 
                prompt: "Which item?", 
                key: "itemToEdit", 
                parse: e => e.toUpperCase()
            },{
                type: "string", 
                prompt: "Are you editing the `name` or `link`?", 
                key: "changeType", 
                oneOf: ["name", "link"], 
                parse: e => e.toLowerCase()
            }, {
                type: "string", 
                prompt: "What is the new value?", 
                key: "newValue",
            }]
        })
    }
    async run(msg, { itemToEdit, changeType, newValue }){

        let embed = new MessageEmbed()
        .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
        .setColor("RADNOM")
        .setTimestamp()
        .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))

        const ITEMS = await this.client.dbs.items.findOne({DB_ID: process.env.DB_ID})
        if(!ITEMS) return embed.setTitle(`The items database is missing`), 
        msg.say(embed).catch(err => console.log(err))

        if(ITEMS.items.length < 1) return embed.setTitle(`There are no items in the database`), 
        msg.say(embed).catch(err => console.log(err))

        const findItem = ITEMS.items.filter(e => e.name.includes(itemToEdit))[0]
        if(!findItem) return embed.setTitle(`I couldn't find an item named: ${itemToEdit} in the database`), 
        msg.say(embed).catch(err => console.log(err))

        switch(changeType){
            case "name" : {
                findItem.name = newValue.toUpperCase()
                ITEMS.markModified(`items`)
                ITEMS.save().catch(err => console.log(err))
                embed.setTitle(`Name updated`)
                msg.say(embed).catch(err => console.log(err))
            } 
            break
            case "link" : {
                const vidData = await this.client.functions.getMeta.getMetaData(newValue)
                const thumbnail = vidData.thumbnails.high.url

                findItem.link = newValue
                findItem.thumbnail = thumbnail

                ITEMS.markModified(`items`)
                ITEMS.save().catch(err => console.log(err))
                embed.setTitle(`Name updated`)
                msg.say(embed).catch(err => console.log(err))
            }
            break
        }

    }
}