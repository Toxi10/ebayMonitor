const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { PRODUCT, WEBHOOK } = require('./config');

try {

    if(!PRODUCT) throw "Missing PRODUCT: Edit `config.js` and restart.";
    if(!WEBHOOK.URL) throw "Missing WEBHOOK URL: Edit `config.js` and restart.";
    if(!WEBHOOK.USERNAME || !WEBHOOK.AVATAR_URL || !WEBHOOK.COLOR || !WEBHOOK.TITLE) throw "Missing embed informations: Edit `config.js` and restart.";

    const URL = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${PRODUCT.split(" ").join("+")}&_sacat=0&_sop=10`;

    console.log(`Bot online! Listening for: ${PRODUCT} on "${URL}"`);

    var lastID;

    setInterval(function(){ 

        axios(URL)
            .then(res => {
                const html = res.data;
                const $ = cheerio.load(html);
                const item = $('.srp-river-results > ul > .s-item')[0];
                
                    var product = {
                        name : $(item).find('a > h3').text().split("New Listing")[1],
                        condition: $(item).find('.s-item__subtitle > .SECONDARY_INFO').text(),
                        id: $(item).find('.s-item__image-section > .s-item__image > a > .s-item__image-wrapper > img').attr('src').split('/')[6],
                        url : $(item).find('a').attr('href'),
                        price : $(item).find('.s-item__price').text(),
                        image : $(item).find('.s-item__image-section > .s-item__image > a > .s-item__image-wrapper > img').attr('src').replace('s-l225.jpg', 's-l500.jpg'),
                        date: $(item).find('.s-item__detail > span > .BOLD').text(),
                        stars: $(item).find('.x-star-rating > .clipped').text() || "No Reviews"
                    }

                    if(lastID !== product.id) {
                        fetch(
                        WEBHOOK.URL,
                        {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: WEBHOOK.USERNAME,
                                avatar_url: WEBHOOK.AVATAR_URL,
                                embeds: [
                                {
                                    color: WEBHOOK.COLOR,
                                    author: {
                                    name: WEBHOOK.TITLE,
                                    },
              
                                    title: product.name,
                                    url: product.url,
                                    fields: [
                                    {
                                        name: 'Condition',
                                        value: product.condition,
                                    },
                                    {
                                        name: 'Price',
                                        value: product.price,
                                    },
                                    {
                                        name: 'Review',
                                        value: product.stars,
                                    },
                                    {
                                        name: 'Upload',
                                        value: product.date,
                                    },
                                    {
                                        name: 'ID',
                                        value: product.id,
                                    },
                                    ],
              
                                    image: {
                                    url:
                                        product.image,
                                    },
                                },
                                ],
                            }),
                        }
                        );

                        lastID = product.id;
                        console.log(`[Success] New item found! {ID: ${product.id}}`);
                    }

            })

    }, 30000);

}

catch(err) {
    return console.log(`[Error] ${err}`);
}