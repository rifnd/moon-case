const { JSDOM } = require('jsdom')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const axios = require('axios')

module.exports = { 
facebook, 
facebook2
}

function facebook(url){
	return new Promise((resolve,reject) => {
	let config = {
'url': url
}
	axios('https://www.getfvid.com/downloader',{
	method: 'POST',
	data: new URLSearchParams(Object.entries(config)),
	headers: {
"content-type": "application/x-www-form-urlencoded",
"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
"cookie": "_ga=GA1.2.1310699039.1624884412; _pbjs_userid_consent_data=3524755945110770; cto_bidid=rQH5Tl9NNm5IWFZsem00SVVuZGpEd21sWnp0WmhUeTZpRXdkWlRUOSUyQkYlMkJQQnJRSHVPZ3Fhb1R2UUFiTWJuVGlhVkN1TGM2anhDT1M1Qk0ydHlBb21LJTJGNkdCOWtZalRtZFlxJTJGa3FVTG1TaHlzdDRvJTNE; cto_bundle=g1Ka319NaThuSmh6UklyWm5vV2pkb3NYaUZMeWlHVUtDbVBmeldhNm5qVGVwWnJzSUElMkJXVDdORmU5VElvV2pXUTJhQ3owVWI5enE1WjJ4ZHR5NDZqd1hCZnVHVGZmOEd0eURzcSUyQkNDcHZsR0xJcTZaRFZEMDkzUk1xSmhYMlY0TTdUY0hpZm9NTk5GYXVxWjBJZTR0dE9rQmZ3JTNEJTNE; _gid=GA1.2.908874955.1625126838; __gads=ID=5be9d413ff899546-22e04a9e18ca0046:T=1625126836:RT=1625126836:S=ALNI_Ma0axY94aSdwMIg95hxZVZ-JGNT2w; cookieconsent_status=dismiss"
	}
})
	.then(async({ data }) => {
const $ = cheerio.load(data);	
resolve({
	video: $('div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
	audio: $('div.col-md-4.btns-download > p:nth-child(3) > a').attr('href')
	})
})
	.catch(reject)
	})
}

function facebook2(urls) {
    return new Promise(async (resolve, reject) => {
       const data = await axios({
           url: 'https://downvideo.net/',
           method: 'GET',
           headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
           }
       })
       const $ = cheerio.load(data.data)
       const token = $('#token').attr('value')
       const getPost = await axios({
           url: 'https://downvideo.net/download.php',
           method: 'POST',
           headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
            "cookie": '_gid=GA1.2.1321544464.1633811193; _ga=GA1.2.1392580783.1633811193; __gads=ID=c73de99d7fa5c467-226981f63ecc00f1:T=1633811193:RT=1633811193:S=ALNI_MaC9fW2mqfT2hm7zODcNNffab1XLg'
           },
           data: new URLSearchParams(Object.entries({ 'URL': urls, 'token': token }))
       })
       const c = cheerio.load(getPost.data)
       const hasil = {
            author: c('div.row').find('div.col-md-12:nth-child(1)').text(),
            title: c('div.row').find('div.col-md-12:nth-child(3) > p').text(),
            thumb: c('div.row').find('div.col-md-12:nth-child(2) > img').attr('src'),
            link_high: c('div.row').find('div.col-md-3 > a').eq(0).attr('href') || c('div.row').find('#sd > a').attr('href') || '',
            link_normal: c('div.row').find('div.col-md-3 > a').eq(1).attr('href') || ''
       }
       resolve({ status: getPost.status, creator: '@rasel.ganz', hasil: hasil })
    })
}

