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
        let sourcePath = path.join(resourcePath, './data.json')
        await fs.readFile(sourcePath, (err, arr = '[]') => {
            let a = JSON.parse(arr.toString())
            a.push(data)
            return fs.writeFileSync(sourcePath, JSON.stringify(a))
        })
    }
}