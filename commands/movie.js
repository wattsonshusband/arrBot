const { tmdb_search } = require('../utils/tmdb_search');
const { forward_to_radarr } = require('../utils/forward');

module.exports = {
 name: "searchmovie",
 description: "Searches for a movie by name.",
 usage: "searchmovie <movie name>",
 aliases: ['sm'],
 permissions: null,
 run: async (client, msg, args) => {
  tmdb_search(args.join(" "), "movie").then(async results => {
   let reply = results.map((r, i) => `**${i+1}.** ${r.title} (${r.release_date ? r.release_date.split("-")[0] : "N/A"}) - \`TMDB ID: ${r.id}\``).join("\n");
   
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

    await forward_to_radarr(client, msg, chosen.id, chosen.title);
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
   return msg.reply(`Sorry about that. I couldn't find anything with that name...`)
  })
 }
}