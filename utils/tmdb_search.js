const { get } = require('axios');

const TMDB_API = process.env.TMDB_API;
const TMDB_BASE_SEARCH = "https://api.themoviedb.org/3/search/";
function tmdb_search(query, type){
 return new Promise(async (res, rej) => {
  let url = TMDB_BASE_SEARCH + (type == "movie" ? "movie" : "tv") + `?api_key=${TMDB_API}&query=${encodeURIComponent(query)}`;
  try {
   const resp = await get(url)

   if(resp.status == 200){
    const data = await resp.data;
    if(data.results.length > 0){
     return res(data.results.slice(0, 5));
    }
   }

   return rej("no results found.")
  }catch (error){ return rej(error); }
 })
}

module.exports = { tmdb_search };