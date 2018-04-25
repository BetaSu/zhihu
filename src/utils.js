const path = require('path')
const fs = require('fs')
let resourcePath = path.join(__dirname, '../source')
let models = require('../db/model')

let TOTAL_GET = 1;

module.exports = {
    async disableImg (page) {
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) {
                interceptedRequest.abort()
            } else {
                interceptedRequest.continue()
            }
        })
    },
    async output (data) {
        console.log(`获取第${TOTAL_GET++}条：`, data.title);
        data.index = TOTAL_GET
        new models.QuestionModel(data).save((err, data) => {
            if (err) return console.log('入库错误：', err);
        })
    }
}