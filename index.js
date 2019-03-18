const Router = require('koa-router')
const compose = require('koa-compose')
const p = require('path')
const fs = require('fs')

function applyDirToRouter (path, followPrefix = '/', isRoot = false) {
  let _router = new Router()
  let _followRouter = new Router()
  let routerUsed = false

  function router () {
    routerUsed = true
    return _router
  }

  function followRouter () {
    routerUsed = true
    return _followRouter
  }

  let dirents = fs.readdirSync(path, { withFileTypes: true })

  if (!isRoot) {
    if (dirents.find(v => v.name === '_' && v.isDirectory())) {
      let dirents2 = fs.readdirSync(p.join(path, '_'), { withFileTypes: true })
      if (dirents2.find(v => v.name === 'index.js' && v.isFile())) {
        let f = require(p.join(path, '_', 'index.js'))
        typeof f === 'function' && f(router())
      }
      for (let dirent of dirents2) {
        if (dirent.isFile() && dirent.name.endsWith('.js')) {
          if (dirent.name === 'index.js') continue

          let f = require(p.join(path, '_', dirent.name))
          typeof f === 'function' && f(router())
        }
      }
    }
    if (dirents.find(v => v.name === 'index.js' && v.isFile())) {
      let f = require(p.join(path, 'index.js'))
      typeof f === 'function' && f(followRouter())
    }
  }
  for (let dirent of dirents) {
    if (dirent.isFile() && dirent.name.endsWith('.js')) {
      if (dirent.name === 'index.js') continue

      let f = require(p.join(path, dirent.name))
      typeof f === 'function' && f(followRouter())
    } else if (dirent.isDirectory()) {
      if (dirent.name === '_') continue

      let splits = dirent.name.split('|')
      let prefix = '/' + splits[0]
      let followPrefix = '/' + splits.slice(1).join('/')

      let subRouter = applyDirToRouter(p.join(path, dirent.name), followPrefix)
      subRouter &&
      followRouter().use(prefix, subRouter.routes(), subRouter.allowedMethods())
    }
  }
  if (isRoot) return _followRouter
  if (!routerUsed) {
    return null
  } else {
    _router.use(followPrefix, _followRouter.routes(), _followRouter.allowedMethods())
    return _router
  }
}

module.exports = function (dirname) {
  let router = applyDirToRouter(dirname, '/', true)

  return compose([router.routes(), router.allowedMethods()])
}
