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
        console.log(`开始:${options.start},当前:${options.cur},第${data.index}条：`, data.title);
        new models.QuestionModel(data).save((err, data) => {
            if (err) return console.log('入库错误：', err);
        })
    },
    restart () {
        fs.writeFileSync('./restart.txt', new Date())
    }
}