const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { stripIndents } = require("common-tags")

module.exports = class collected extends Command { 
    constructor(client){
        super(client, {
            name: "collected", 
            description: "Mark an item as collected!",
            group: "tracker", 
            memberName: "collected",
            args: [{
                type: "string", 
                prompt: "Which item have you collected?", 
                key: "item", 
                parse: e => e.toUpperCase()
            }]
        })
    }
    async run(msg, { item }){

        const ITEMS = await this.client.dbs.items.findOne({ DB_ID: process.env.DB_ID })

        const dbErrMsg = `Error finding item database. The developers are aware and are currently working on a fix. There is no need to report this to them.`

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
            let findItem = ITEMS.items.find(i => i.name === item)
            if(!findItem) return msg.say(`This isn't a valid item`)

            const P = await this.client.dbs.profile.findOne({userID: msg.author.id})
            if(!P){
                new this.client.dbs.profile({
                    userID: msg.author.id, 
                    collectedItems: [item]
                }).save().catch(err => console.log(err))

                let owners = this.client.formattedOwners

                return msg.say(new MessageEmbed()
                .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
                .setDescription(stripIndents`Congratulations on collecting the ${item.replace(`_`, ' ')}
                
                **IMPORTANT**: By using this bot you concent to our [insert privacy policy channel].
                If you have any questions or wish to remove data stored on you please contact ${owners}`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true})))

            }else if(P.collectedItems.includes(item)){
                return msg.say(`You've already collected this item`)
            }else{
                P.collectedItems.push(item)
                P.save().catch(err => console.log(err))
                return msg.say(`Ok, I marked ${item} as collected`)
            }

        }

    }
}