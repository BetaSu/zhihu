let path = require('path')
let fs = require('fs')
let puppeteer = require('puppeteer')
let loginInfo = require('./config')
let resourcePath = path.join(__dirname, '../source')
let config = require('../config')
const utils = require('./utils')

let PAGE_COUNT = 1
let RETRY_COUNT = 1
let TOTAL_GET = 1
// 最大重连数
let RETRY_TIME = 50
// 当前循环
let CUR_CYCLE = 0
let BROWSER_INIT = false
let START_TIME = 0
// 超时重连时间
let TIMEOUT = 1000 * 60

let curBrowser

let restartTimer = null

function makeTimer() {
    return setTimeout(() => {
        utils.restart()
    }, TIMEOUT)
}

function refresh() {
    if (restartTimer) {
        clearTimeout(restartTimer)
        restartTimer = makeTimer()
    }
}

async function init() {
    CUR_CYCLE++
    TOTAL_GET = 1
    if (!curBrowser) {
        START_TIME = new Date()
        curBrowser = await puppeteer.launch({
            headless: config.headless,
            // args: ['--no-sandbox']
        }) 
    }
    const page = await curBrowser.newPage()
    await page.setCookie(loginInfo)
    await utils.disableImg(page)
    await page.goto('https://www.zhihu.com/topic#%E7%94%9F%E6%B4%BB')
    await page.waitFor(config.INTERVAL)

    if (!BROWSER_INIT) {
        BROWSER_INIT = true
        curBrowser.on('targetcreated',async target => {
            let page = await target.page()
            if (page) {
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
                refresh()
                await utils.output({
                    type: 'question',
                    title,
                    id,
                    answerCount: Number(answerCount),
                    follow: Number(follow),
                    view: Number(view),
                    index: TOTAL_GET++
                }, {
                    start: START_TIME,
                    cur: new Date()
                })
                await page.close()
            }
        }) 
    }

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
    restartTimer =  makeTimer()
    await loop(page, CUR_CYCLE)
}

async function loop(mainPage, cycle) {
    if (TOTAL_GET > 500) {
        console.log('抓取大于500条数据，重启应用');
        mainPage.waitFor(config.INTERVAL)
        await mainPage.close()
        // 修改为重启 
        utils.restart()
        // await init()  
    } else {
        await loopFn(mainPage, cycle).catch(async e => {
            console.log(`loop发生promise错误，尝试第${RETRY_COUNT++}次重连`);
            refresh()
            if (RETRY_COUNT > RETRY_TIME) {
                console.log('超过最大重连数' + RETRY_TIME, '，重启应用');
                utils.restart()
            } else {
                if (cycle !== CUR_CYCLE) {
                    console.log('取消前一次循环的剩余任务');
                    return
                }
                await loop(mainPage, cycle)
            }
        })
    }
}

async function loopFn(mainPage, cycle) {
    await mainPage.waitFor(config.INTERVAL)
    let handleList = await getUrlHandle(mainPage)
    if (handleList.length) {
        await getDetailByHandle(mainPage, handleList)
    }
    await loop(mainPage, cycle)
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