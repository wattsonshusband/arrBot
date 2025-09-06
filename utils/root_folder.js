const axios = require('axios')

function get_root_folder_radarr(client){
 return new Promise(async (res, rej) => {
  const url = client.radarr_url + "/api/v3/rootfolder", options = { headers: { "X-Api-Key": client.radarr_api }};
  try {
   const resp = await axios.get(url, options)

   if(resp.status == 200){
    const data = await resp.data;
    if(data.length > 0){
     return res(data[0].path);
    }

    return rej("no root folder found.");
   }
  }
  catch (error){
   return rej(error);
  }
 })
}

function get_root_folder_sonarr(client){
 return new Promise(async (res, rej) => {
  const url = client.sonarr_url + "/api/v3/rootfolder", options = { headers: { "X-Api-Key": client.sonarr_api }};
  try {
   const resp = await axios.get(url, options)

   if(resp.status == 200){
    const data = await resp.data;
    if(data.length > 0){
     return res(data[0].path);
    }

    return rej("no root folder found.");
   }
  }
  catch (error){
   return rej(error);
  }
 })
}

module.exports = {
 get_root_folder_radarr,
 get_root_folder_sonarr
}