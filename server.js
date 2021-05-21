const Koa = require('koa')
const Router = require('@koa/router')
const koaSend = require('koa-send')
const koaBody = require('koa-body')
const koaWebpack = require('koa-webpack')
const portfinder = require('portfinder')
const fs = require('fs')
const app = new Koa()
const router = new Router()
const webpackConfig = require('./webpack.config.js')

koaWebpack({
  config: webpackConfig,
  hotClient: {
    logLevel: 'warn'
  },
  devMiddleware: {
    stats: webpackConfig.stats
  }
}).then((middleware) => {
  app.use(middleware)
  
  app.use(async (ctx, next) => {
    let done = false
    if (ctx.method === 'HEAD' || ctx.method === 'GET') {
      try {
        done = await koaSend(ctx, ctx.path, {
          root: __dirname + '/dist/',
          index: 'index.html'
        })
      } catch (err) {
        if (err.status !== 404) throw err
      }
    }
    if (!done) await next()
  })
  
  if (!fs.existsSync(__dirname + '/cache/')) fs.mkdirSync(__dirname + '/cache/')
  app.use(koaBody({
    multipart: true,
    formidable: {
      multipart: true,
      uploadDir: __dirname + '/cache/',
      keepExtensions: true,
      maxFileSize: 1024 * 1024 * 1024 // 1G
    }
  }))
  
  router.post('/file/upload', async (ctx, next) => {
    ctx.body = {
      code: 200,
      nowTime: new Date().getTime(),
      data: ctx.request.files.file.path
    }
  })
  app.use(router.routes()).use(router.allowedMethods())

  portfinder.getPort((err, port) => {
    if (err) throw new Error(err)
    app.listen(port, () => {
      console.log(`server running here: http://localhost:${port}`)
    })
  })
})
