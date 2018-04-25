let path = require('path')
let fs = require('fs')
let puppeteer = require('puppeteer')
let loginInfo = require('./config')
let resourcePath = path.join(__dirname, '../source')
let config = require('../config')
const utils = require('./utils')

let PAGE_COUNT = 1
let RETRY_COUNT = 1
let TOTAL_GET = 1;
// let RUNNING_TIME = Date.now()

let curBrowser

// async function run() {
//     await init().catch(async e => {
//         console.log(`发生promise错误，尝试第${RETRY_COUNT++}次重连`);
//         await run()
//     })
// }

async function init() {
    if (curBrowser && curBrowser.close) {
        await curBrowser.close()
    }
    const browser = await puppeteer.launch({
        headless: config.headless,
        // args: ['--no-sandbox']
    })
    curBrowser = browser
    const page = await browser.newPage()
    await page.setCookie(loginInfo)
    await utils.disableImg(page)
    await page.goto('https://www.zhihu.com/topic#%E7%94%9F%E6%B4%BB')
    await page.waitFor(config.INTERVAL)

    browser.on('targetcreated',async target => {
        let page = await target.page()
        if (page) {
            mainPage = page
            await utils.disableImg(page)
            await page.waitFor(config.INTERVAL)
            let title = await page.$eval('.QuestionHeader-title', dom => dom.innerText)
            let rest = title.indexOf('修改')
            if (title.length === rest + 2) {
                title = title.slice(0, rest)
            }
            let answerCount = await page.$eval('.List-headerText span', dom => dom.innerText.split(' ')[0])
            answerCount = answerCount.split(',').join('')
            let board = await page.evaluate(() => Array.from(document.body.querySelectorAll('.QuestionFollowStatus-counts .NumberBoard-itemValue'), ({ title }) => title))
            let follow = board[0]
            let view = board[1]
            let id = Number(page.url().split('/').pop())
            await utils.output({
                type: 'question',
                title,
                id,
                answerCount: Number(answerCount),
                follow: Number(follow),
                view: Number(view),
                index: TOTAL_GET++
            })
            await page.close()
        }
    })

    await page.evaluate(() => {
        setInterval(() => {
            document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + 40
        }, 100)
    })
    if (config.screenshot) {
        console.log('创建截屏');
        await page.screenshot({path: path.join(resourcePath, 'after_login.png')})
    }
    console.log('初始化成功');
    await loop(page)
}

async function loop(mainPage) {
    if (TOTAL_GET > 500) {
        await curBrowser.close()
        await init()
    } else {
        await loopFn(mainPage).catch(async e => {
            console.log(`loop发生promise错误，尝试第${RETRY_COUNT++}次重连`);
            await loop(mainPage)
        })
    }
}

async function loopFn(mainPage) {
    await mainPage.waitFor(config.INTERVAL)
    let handleList = await getUrlHandle(mainPage)
    if (handleList.length) {
        await getDetailByHandle(mainPage, handleList)
    }
    await loop(mainPage)
}

// 获取列表页所有问题的url
// async function getUrl(page) {
//     return await page.evaluate(() => Array.from(document.body.querySelectorAll('[data-za-detail-view-element_name="Title"]'), ({ href }) => href))
// }

// 获取列表页所有问题的handle
async function getUrlHandle(page) {
    return await page.$$('[data-za-element-name="Title"]')
}

async function getDetailByHandle(mainPage, handleList) {
    // console.log(`第${PAGE_COUNT++}次拉取数据`)
    for (let i = 0; i < handleList.length; i++) {
        let handle = handleList[i]
        let property = await handle.getProperty('href')
        let url = await property.jsonValue()
        // 过滤掉不是详情页的 比如 专栏页
        if (typeof url === 'string') {
            if (!url.split('/').includes('question')) continue
        }
        await handle.click({
            delay: 10
        })
        await mainPage.evaluate(async (url) => {
            Array.from(document.querySelectorAll('.feed-item')).forEach(function (card) {
                let a = card.querySelector('[data-za-element-name="Title"]')
                if (a && a.href === url) {
                    card.parentNode.removeChild(card)
                }
            })
        }, url)
    }
}

module.exports = init