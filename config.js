
module.exports = {
    // 爬取数据的延迟时间，请根据当前网络情况来设置。
    // 延迟越短效率越高，但是太短可能触发反爬虫机制或者由于页面还未加载完成而抓取不到数据。
    INTERVAL: 1000,
    // 请登录知乎后 填入 cookie 中 z_c0 的 value值，用于模拟登录状态
    cookie: "2|1:0|10:1524037404|4:z_c0|92:Mi4xcDloN0FBQUFBQUFBd0tCNDh3QjJEU1lBQUFCZ0FsVk5IRVhFV3dCalI2cjZuMURDR3ZFX1JUb3IzdkQ2aTEyNkJR|92fadbf61c45205f7e5cfcee16ad533b2097ee573a16c3c01c463e566e13add7",
    // 当为true时，初始化成功后会拍一张屏幕快照放入source目录，可以看是否登录成功
    screenshot: false
}