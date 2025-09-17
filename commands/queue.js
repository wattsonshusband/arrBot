const { get_downloading_radarr, get_downloading_sonarr } = require('../utils/queue')

module.exports = {
 name: "queue",
 description: "Displays the current downloading queue for Radarr and Sonarr.",
 usage: "queue <all|sonarr|radarr>",
 aliases: ['q'],
 permissions: null,
 run: async (client, msg, args) => {
  try{
   if(!args[0] || (args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'sonarr' && args[0].toLowerCase() != 'radarr')){
    const error_msg = await msg.reply('Please specify which activity you want to see: `all`, `sonarr` or `radarr`.');
    client.delete_msg(error_msg, 15000);
    client.delete_msg(msg, 15000);
    return;
   }

   let reply_msg = '';
   if(args[0].toLowerCase() == 'all' || args[0].toLowerCase() == 'sonarr'){
    const sonarr_queue = await get_downloading_sonarr(client, 1, 5);
    if(sonarr_queue.length == 0){
     reply_msg += '**Sonarr**\n_No Current Downloads_\n\n';
    }else{
     reply_msg += '**Sonarr**\n';
     sonarr_queue.forEach(item => {
      let time_left = 'N/A', size_left = 'N/A';
      if(item.timeleft && item.timeleft != '00:00:00'){ time_left = new Date(item.timeleft * 1000).toISOString().substring(11, 19) }
      if(item.sizeleft && item.sizeleft != 0){ size_left = (item.sizeleft / (1024 * 1024)).toFixed(2) + ' MB' }
      reply_msg += `- ${item.series.title} S${item.seasonNumber}E${item.episode.episodeNumber} | ${item.episode.title} - ${size_left} left - ETA: ${time_left}\n`;
     });
    }
   }

   if(args[0].toLowerCase() == 'all' || args[0].toLowerCase() == 'radarr'){
    const radarr_queue = await get_downloading_radarr(client, 1, 5);
    if(radarr_queue.length == 0){
     reply_msg += '**Radarr**\n_No Current Downloads_\n\n';
    }else{
     reply_msg += '**Radarr**\n';
     radarr_queue.forEach(item => {
      let time_left = 'N/A', size_left = 'N/A';
      if(item.timeleft && item.timeleft != '00:00:00'){ time_left = new Date(item.timeleft * 1000).toISOString().substring(11, 19) }
      if(item.sizeleft && item.sizeleft != 0){ size_left = (item.sizeleft / (1024 * 1024)).toFixed(2) + ' MB' }
      reply_msg += `- ${item.movie.title} (${item.movie.year}) - ${size_left} left - ETA: ${time_left}\n`;
     });
    }
   }

   const final_msg = await msg.reply(reply_msg.trim());
   client.delete_msg(final_msg, 30000);
   client.delete_msg(msg, 30000);
   return;
  }
  catch(err){
   console.log(`Sonarr/Radarr Queue Exception: ${err}`);
   const error_msg = await msg.reply("Sorry, something big broke when trying to collect queue.")
   client.delete_msg(error_msg, 15000);
   client.delete_msg(msg, 15100);
   return;
  }
 }
}