// //const proxy = require('http-proxy-middleware')

// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function (app) {
//     // proxy第一个参数为要代理的路由
//     // 第二参数中target为代理后的请求网址，changeOrigin是否改变请求头，其他参数请看官网
//     // target: 'http://dt.80gd.cn:9999',

//     app.use(createProxyMiddleware('/api', {
//       target: 'http://dt.80gd.cn:9999',
//         pathRewrite: {
//           "^/api": "/api"
//         },
//         changeOrigin: true 
//     }))
// }
