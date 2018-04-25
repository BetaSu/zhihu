const config = require('../config')
const mongoose = require('mongoose')
const runScrape = require('./scrape_list.js')

let address = `mongodb://${config.dbServername}:${config.dbPort || ''}/${config.dbname}`
mongoose.connect(address, err => {
    if (err) {
        console.log('连接数据库失败', address);
    } else {
        console.log('连接数据库成功!!', address);
        runScrape()
    }
})