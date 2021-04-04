const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { RichDisplay } = require("great-commando")
const Discord = require("discord.js")
const { stripIndents } = require("common-tags")

module.exports = class collection extends Command {
    constructor(client) {
        super(client, {
            name: "collection",
            description: "View all items you've collected",
            group: "tracker",
            memberName: "collection"

        })
    }

    async run(msg) {

        const ITEMS = await this.client.dbs.items.findOne({DB_ID: process.env.DB_ID})

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

        const P = await this.client.dbs.profile.findOne({ userID: msg.author.id })
        const owners = this.client.formattedOwners
        let newProfile = false
        if (!P) {
            new this.client.dbs.profile({
                userID: msg.author.id,
                collectedItems: []
            }).save().catch(err => console.log(err))
            newProfile = true
        }

        let e = new Discord.MessageEmbed().setAuthor(this.client.user.tag, this.client.user.displayAvatarURL({ dynamic: true })).setColor("#228B22")

        let display = new RichDisplay(e)

        switch (newProfile) {
            case false: {

                let collectedItems = P.collectedItems.length
                let neededItems = ITEMS.items.length
                let perc = (collectedItems / neededItems) * 100
                let forBar = perc / 10
                
                const getBar = (rating = 0) => {
                    return `${`▮`.repeat(rating)}${"▯".repeat(10 - rating)}`
                };
                let bar = getBar(forBar);
                
                let progressBar = `${bar} ${Math.round(perc)}%\nItems collected: ${collectedItems} / ${neededItems}`

                const tickEmoji = this.client.emojis.cache.get(this.client.commonEmojis.tick)
                const crossEmoji = this.client.emojis.cache.get(this.client.commonEmojis.cross)
                
                const items = Array.from(ITEMS.items).map(i => i.name)
                const itemsPerPage = 10
                const chunks = new Array(Math.ceil(items.length / itemsPerPage)).fill().map(_ => items.splice(0, itemsPerPage).sort((a, b) => P.collectedItems.includes(b) - P.collectedItems.includes(a)).map(item => `• ${item.toUpperCase()} | ${P.collectedItems.includes(item) ? tickEmoji : crossEmoji }`))

                if(chunks.length > 0){
                    chunks.forEach(chunk => {
                        display.addPage(e => e.setDescription(stripIndents`${chunk.join('\n')}`))
                    })
                }else{
                    display.addPage(e => e.setDescription(stripIndents`You've not marked any items as collected yet!`))
                }
                display.setFooterPrefix(`${progressBar}\nPage: `)

            }
            break
            case true: display.addPage(e => e.setTitle(`You've not marked any items as collected yet!`).setDescription(stripIndents`**IMPORTANT**: By using this bot you concent to our [insert privacy policy channel].
            If you have any questions or wish to remove data stored on you please contact ${owners}`))
            break
        }

        
        display.run(await msg.channel.send(`Loading...`), { filter: (reaction, user) => user.id === msg.author.id })

        }


        

    }
}
