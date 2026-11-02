const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  try {
    const { data } = await axios.get('https://images.search.yahoo.com/search/images?p=' + encodeURIComponent('selang irigasi 16mm'), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    const img = $('#sres img').first().attr('data-src') || $('#sres img').first().attr('src');
    console.log('Found:', img);
  } catch (e) { console.error(e.message); }
}
test();
