const path = require('path')
const fs = require('fs')
let resourcePath = path.join(__dirname, '../source')
let models = require('../db/model')

module.exports = {
    async disableImg (page) {
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) {
                interceptedRequest.abort().catch(e => {})
            } else {
                interceptedRequest.continue().catch(e => {})
            }
        })
    },
    async output (data, options) {
        console.log(`开始:${this.formatDate(options.start)},当前:${this.formatDate(options.cur)},第${data.index}条：`, data.title);
        new models.QuestionModel(data).save((err, data) => {
            if (err) return console.log('入库错误：', err);
        })
    },
    formatDate (d) {
        let date = new Date(d)
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDay()} ${date.getHours()}:${date.getMinutes()}`
    },
    restart () {
        console.log('pm2 重启进程');
        fs.writeFileSync('./restart.txt', new Date())
    }
}