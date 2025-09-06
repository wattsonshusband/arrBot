const axios = require('axios');
const { get_root_folder_radarr, get_root_folder_sonarr } = require('./root_folder');

async function forward_to_radarr(client, msg, tmdbId, movie_name) {
 try{
  let lookup;
  try {
   lookup = await axios.get(`${client.radarr_url}/api/v3/movie/lookup/tmdb`, {
    params: { tmdbId },
    headers: { "X-Api-Key": client.radarr_api },
   });
  } catch (err) {
   console.error("Radarr lookup failed:", err.response?.data || err.message);
  }

  let movie_data = lookup?.data[0];
  if (!movie_data || movie_data.length == 0) {
   const lookup_msg = await msg.channel.send(`Sorry, couldn't find that exact movie in Radarr's lookup. Trying a name search...`);
   console.log(`Fallback to name lookup: ${movie_name}`);
   try {
    const name_lookup = await axios.get(`${client.radarr_url}/api/v3/movie/lookup`, {
     params: { term: movie_name },
     headers: { "X-Api-Key": client.radarr_api },
    });
    movie_data = name_lookup.data || [];
   } catch (err) {
    console.error("Radarr name lookup failed:", err.response?.data || err.message);
   }
  }

  if (!movie_data || movie_data.length == 0) {
   client.delete_msg(msg.reply(`I couldn't find that movie in Radarr's lookup.`), 15000);
   return
  }

  let sel_movie;
  if (movie_data.length === 1) {
   sel_movie = movie_data[0];
  } else {
   const max_choices = Math.min(movie_data.length, client.react_emojis.length);
   movie_data = movie_data.slice(0, max_choices);

   const emojis = client.react_emojis.slice(0, movie_data.length);
   let reply_list = movie_data
    .map((r, i) => `**${i + 1}.** ${r.title} - TMDB: \`${r.tmdbId}\``)
    .join("\n");

   const sent_msg = await msg.reply(`Here are the results I found:\n\n${reply_list}`);
   for (let i = 0; i < movie_data.length; i++) {
    await sent_msg.react(emojis[i]);
   }

   const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && !user.bot;
   const collector = sent_msg.createReactionCollector({ filter, max: 1, time: 15000 });

   const choice = await new Promise(resolve => {
    collector.on("collect", (reaction) => {
     const idx = emojis.indexOf(reaction.emoji.name);
     resolve(movie_data[idx]);
    });
    collector.on("end", (collected) => {
     if (collected.size === 0) resolve(null);

     client.delete_msg(sent_msg, 15000);
     client.delete_msg(lookup_msg, 5000);
    });
   });

   if (!choice) {
    const msg_movie = msg.channel.send("⏳ No one picked a movie.");
    client.delete_msg(msg_movie, 5000);
    return;
   }

   sel_movie = choice;
  }

  const root_folder = await get_root_folder_radarr(client);
  if(!root_folder || root_folder == null || root_folder == undefined)return msg.reply(`uhh I couldn't find a root folder to add that movie to...`).then(msg2 => { msg2.delete({ timeout: 15000 }) });

  const payload = {
   title: sel_movie.title,
   qualityProfileId: 6,
   titleSlug: sel_movie.titleSlug,
   images: sel_movie.images ?? [],
   tmdbId: sel_movie.tmdbId,
   year: sel_movie.year,
   rootFolderPath: root_folder,
   monitored: true,
   addOptions: { searchForMovie: true },
  }

  const add = await axios.post(`${client.radarr_url}/api/v3/movie`, payload, {
   headers: {
    "X-Api-Key": client.radarr_api,
    "Content-Type": "application/json",
   },
  });

  if(add.status == 201){
   const data = await add.data;
   return msg.reply(`I have added **${data.title} (${data.year})** to Radarr.`).then(msg2 => { msg2.delete({ timeout: 15000 }) });
  }

  return msg.reply(`something went wrong when I tried to add that movie...`)
 }catch(error){
  console.error("Radarr error:", error.response?.data || error.message);
  return msg.reply(`something big broke when I tried to search or add that movie...`)
 }
}

async function forward_to_sonarr(client, msg, tvdbId, tv_name) {
 try{
  let lookup;
  try {
   lookup = await axios.get(`${client.sonarr_url}/api/v3/series/lookup`, {
    params: { term: `tvdb:${tvdbId}` },
    headers: { "X-Api-Key": client.sonarr_api },
   });
  } catch (err) {
   console.error("Sonarr lookup failed:", err.response?.data || err.message);
  }

  let tv_data = lookup?.data[0];
  if (!tv_data || tv_data.length == 0) {
   console.log(`Fallback to name lookup: ${tv_name}`);
   try {
    const name_lookup = await axios.get(`${client.sonarr_url}/api/v3/series/lookup`, {
     params: { term: tv_name },
     headers: { "X-Api-Key": client.sonarr_api },
    });
    tv_data = name_lookup.data || [];
   } catch (err) {
    console.error("Sonarr name lookup failed:", err.response?.data || err.message);
   }
  }

  if (!tv_data || tv_data.length == 0) {
   client.delete_msg(msg.reply(`I couldn't find that series in Sonarr's lookup.`), 15000);
   return
  }

  let series_data;
  if (tv_data.length === 1) {
   series_data = tv_data[0];
  } else {
   const max_choices = Math.min(tv_data.length, client.react_emojis.length);
   tv_data = tv_data.slice(0, max_choices);

   const emojis = client.react_emojis.slice(0, tv_data.length);
   let reply_list = tv_data
    .map((r, i) => `**${i + 1}.** ${r.title} - TVDB: \`${r.tvdbId}\``)
    .join("\n");

   const sent_msg = await msg.reply(`Here are the results I found:\n\n${reply_list}`);
   for (let i = 0; i < tv_data.length; i++) {
    await sent_msg.react(emojis[i]);
   }

   const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && !user.bot;
   const collector = sent_msg.createReactionCollector({ filter, max: 1, time: 15000 });

   const choice = await new Promise(resolve => {
    collector.on("collect", (reaction) => {
     const idx = emojis.indexOf(reaction.emoji.name);
     resolve(tv_data[idx]);
    });
    collector.on("end", (collected) => {
     if (collected.size === 0) resolve(null);

     client.delete_msg(sent_msg, 15000);
    });
   });

   if (!choice) {
    const msg_series = msg.channel.send("⏳ No one picked a series.");
    client.delete_msg(msg_series, 5000);
    return;
   }

   series_data = choice;
  }

  const root_folder = await get_root_folder_sonarr(client);
  if(!root_folder || root_folder == null || root_folder == undefined)return msg.reply(`uhh I couldn't find a root folder to add that movie to...`).then(msg2 => { msg2.delete({ timeout: 15000 }) });

  const payload = {
   title: series_data.title,
   qualityProfileId: 6,
   titleSlug: series_data.titleSlug,
   images: series_data.images ?? [],
   tvdbId: series_data.tvdbId,
   rootFolderPath: root_folder,
   monitored: true,
   seasonFolder: true,
   addOptions: { searchForMissingEpisodes: true },
  }

  const add = await axios.post(`${client.sonarr_url}/api/v3/series`, payload, {
   headers: { "X-Api-Key": client.sonarr_api, "Content-Type": "application/json" }
  });

  if(add.status == 201){
   const data = await add.data;
   client.delete_msg(msg.reply(`I have added **${data.title}** to Sonarr.`), 15000);
   return;
  }

  return msg.reply(`something went wrong when I tried to add that series...`)
 }catch(error){
  console.error("Sonarr error:", error.response?.data || error.message);
  return msg.reply(`something big broke when I tried to search or add that series...`)
 }
}

module.exports = { forward_to_radarr, forward_to_sonarr }