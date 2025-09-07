const axios = require('axios');

const invalid_events = ['downloadImported', 'seriesFolderImported', 'downloadFolderImported', 'downloadFailed', 'movieFolderImported'];
function get_history_sonarr(client, page = 1, page_size = 10){
 return new Promise(async (res, rej) => {
  try{
   const resp = await axios.get(`${client.sonarr_url}/api/v3/history`, {
    params: {
     page, 
     pageSize: page_size, 
     sortKey: 'date', 
     sortDir: 'desc',
     includeEpisode: true,
     includeSeries: true
    },
    headers: {
     'X-Api-Key': client.sonarr_api
    }});

   const grabbed = (resp.data.records || []).filter(r => invalid_events.includes(r.eventType) === false);
   return res(grabbed);
  }catch(err){
   console.error(`Error fetching Sonarr history: ${err}`);
   return rej(err);
  }
 });
}

function get_history_radarr(client, page = 1, page_size = 10){
 return new Promise(async (res, rej) => {
  try{
   const resp = await axios.get(`${client.radarr_url}/api/v3/history`, {
    params: {
     page, 
     pageSize: page_size, 
     sortKey: 'date', 
     sortDirection: 'descending',
     includeMovie: true
    },
    headers: {
     'X-Api-Key': client.radarr_api
    }});

   const grabbed = (resp.data.records || []).filter(r => invalid_events.includes(r.eventType) === false);
   return res(grabbed);
  }catch(err){
   console.error(`Error fetching Radarr history: ${err}`);
   return rej(err);
  }
 });
}

module.exports = { get_history_radarr, get_history_sonarr }