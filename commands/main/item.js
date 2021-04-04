const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { stripIndents } = require("common-tags")

module.exports = class item extends Command {
    constructor(client) {
        super(client, {
            name: "item",
            description: "View information on an item",
            memberName: "item",
            group: "main",
            args: [{
                type: "string", 
                prompt: "Which item are you searching for?", 
                key: "item", 
                parse: i => i.toUpperCase()
            }]
        })
    }

    async run(msg, { item }) {

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


            let itemToFind = ITEMS.items.find(i => i.name === item)
            if(!itemToFind) return msg.say(new MessageEmbed()
            .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
            .setTitle(`Couldn't find an item named ${item.toUpperCase()}`)
            .setDescription(stripIndents`- Check spelling
            - Check \`${this.client.commandPrefix}items\` to see a list of all items`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))).catch(err => console.log(err))
            
            msg.say(new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(stripIndents`
                Item Name: ${itemToFind.name}
                [YouTube Link](${itemToFind.link})`)
                .setImage(itemToFind.thumbnail)
                .setColor("RANDOM")
                .setTimestamp()
                .setFooter(`Item Count: ${ITEMS.items.length}`, this.client.user.displayAvatarURL({ dynamic: true }))
            ).catch(err => console.log(err))
        }
    }

}