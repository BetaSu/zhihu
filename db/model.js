const config = require('../config')
const mongoose = require('mongoose')
mongoose.connect(`mongodb://${config.dbServername}:${config.dbPort || ''}/${config.dbname}`)

let db = mongoose.connection
db.once('open', () => {
    console.log('连接数据库成功!!');
})

db.on('error', () => {
    console.log('连接数据库失败');
})

module.exports = mongoose