const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { stripIndents } = require("common-tags")

module.exports = class uncollect extends Command {
    constructor(client){
        super(client, {
            name: "uncollect", 
            description: "Remove an item from your collection", 
            memberName: "uncollect", 
            group: "tracker", 
            args: [{
                type: "string", 
                prompt: "Which item?", 
                key: "item", 
                parse: i => i.toUpperCase()
            }]
        })
    }

    async run(msg, { item }) { 

        const ITEMS = await this.client.dbs.ITEMS.findOne({DB_ID: process.env.DB_ID})

        if (!ITEMS) {

            if (this.client.missingDBErrorSent === false) {
                this.client.missingDBErrorSent = true
                msg.say(dbErrMsg).catch(err => console.log(err))
                this.client.owners.forEach(o => {
                    this.client.users.cache.get(o.id).send(`[Database missing] - CMD: \`items\``).catch(() => { })
                    return
                })
            } else if (this.client.missingDBErrorSent === true) {
                return msg.say(dbErrMsg).catch(err => console.log(err))
            }
        } else {

            let embed = new MessageEmbed()
            .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
            .setColor("RANDOM")
            .setTimestamp()
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))

            const P = await this.client.dbs.profile.findOne({userID: msg.author.id})
            if(!P){
                embed.setDescription(stripIndents`You've not marked any items as ollected yet!`)
                return msg.say(embed).catch(err => console.log(err))
            }

            const itemExists = ITEMS.items.find(i => i.name === item)
            if(!itemExists){
                embed.setDescription(stripIndents`${item} isn't a valid item!`)
                return msg.say(embed).catch(err => console.log(err))
            }

            const markedAsCollected = P.collectedItems.find(i => i === item)
            if(!markedAsCollected){
                embed.setDescription(stripIndents`You've not marked this item as collected!`)
                return msg.say(embed).catch(err => console.log(err))
            }

            P.collectedItems = P.collectedItems.filter(i => i !== item)

            P.save().catch(err => console.log(err))

            embed.setDescription(stripIndents`Ok, I marked ${item} as uncollected!`)
            return msg.say(embed).catch(err => console.log(err))
        }


    }

}