
const mongoose = require('mongoose')
const Schema = mongoose.Schema

 // 记录问题详情的schema
 let questionSchema = new mongoose.Schema({
    type: String,
    title: String,
    // 本次抓取该问题的索引
    index: Number,
    id: Number,
    // 回答数
    answerCount: Number,
    // 关注数
    follow: Number,
    // 浏览量
    view: Number
}, {timestamps: true})
let QuestionModel = mongoose.model('QuestionModel', questionSchema)


module.exports = {QuestionModel}