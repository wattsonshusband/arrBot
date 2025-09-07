const axios = require('axios');

function get_downloading_sonarr(client, page = 1, page_size = 10) {
 return new Promise(async (res, rej) => {
  try {
   const resp = await axios.get(`${client.sonarr_url}/api/v3/queue`, {
    params: {
     page,
     pageSize: page_size,
     sortKey: 'timeleft',
     sortDir: 'asc',
     includeSeries: true,
     includeEpisode: true
    },
    headers: {
     'X-Api-Key': client.sonarr_api
    }
   });

   console.log(resp.data.records)

   const downloading = (resp.data.records || []).filter(
    r => r.status === 'downloading'
   );

   return res(downloading);
  } catch (err) {
   console.error(`Error fetching Sonarr queue:`, err.response?.data || err.message);
   return rej(err);
  }
 });
}

function get_downloading_radarr(client, page = 1, page_size = 10) {
 return new Promise(async (res, rej) => {
  try {
   const resp = await axios.get(`${client.radarr_url}/api/v3/queue`, {
    params: {
     page,
     pageSize: page_size,
     sortKey: 'timeleft',
     sortDirection: 'ascending',
     includeMovie: true
    },
    headers: {
     'X-Api-Key': client.radarr_api
    }
   });

   const downloading = (resp.data.records || []).filter(
    r => r.status === 'downloading'
   );
   
   return res(downloading);
  } catch (err) {
   console.error(`Error fetching Radarr queue:`, err.response?.data || err.message);
   return rej(err);
  }
 });
}

module.exports = { get_downloading_radarr, get_downloading_sonarr }