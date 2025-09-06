const { tmdb_search } = require('../utils/tmdb_search');
const { forward_to_sonarr } = require('../utils/forward');

module.exports = {
 name: "searchtv",
 description: "Searches for a tv by name.",
 usage: "searchtv <tv name>",
 aliases: ['stv'],
 permissions: null,
 run: async (client, msg, args) => {
  tmdb_search(args.join(" "), "tv").then(async results => {
   let reply = results.map((r, i) => `**${i+1}.** ${r.name} (${r.first_air_date ? r.first_air_date.split("-")[0] : "N/A"}) - \`TMDB ID: ${r.id}\``).join("\n");
   
   msg.channel.sendTyping();

   const emojis = client.react_emojis.slice(0, results.length);
   const sent_msg = await msg.reply(`Here are the top results I found:\n\n${reply}`);

   for (let i = 0; i < results.length; i++) {
    await sent_msg.react(emojis[i]);
   }

   const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && !user.bot;
   const collector = sent_msg.createReactionCollector({ filter, max: 1, time: 15000 });

   collector.on("collect", async (reaction, user) => {
    const choiceIndex = emojis.indexOf(reaction.emoji.name);
    const chosen = results[choiceIndex];

    await forward_to_sonarr(client, msg, chosen.id, chosen.name);
   });

   collector.on("end", (collected) => {
    if (collected.size === 0) {
     client.delete_msg(msg.channel.send("⏳ No one picked a movie."), 5000);
    }

    client.delete_msg(sent_msg, 15000);
    client.delete_msg(msg, 15000);
   });
  }).catch(err => {
   console.error(err);
   client.delete_msg(msg.reply(`Sorry about that. I couldn't find anything with that name...`), 10000);
   return msg.delete();
  })
 }
}