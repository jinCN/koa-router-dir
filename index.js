const BSON = require('bson')
const typeIs = require('type-is')
const bytes = require('bytes')
const getBody = require('raw-body')
const Cb = require('@superjs/cb')
let bson = new BSON()
module.exports = function (options = {}) {
  options = {
    ...options
  }
  options.limit = typeof options.limit !== 'number'
    ? bytes.parse(options.limit || '10mb')
    : options.limit
  options.type = Array.isArray(options.type)
    ? [options.type || 'application/bson'] || []
    : options.type
  options.bson = options.bson || bson
  
  return handler.bind(null, options)
}
module.exports.bson = bson

function handler (options = {}, arg1, arg2, arg3) {
  if (isKoa(arg1)) {
    return handlerForKoa(options, arg1, arg2)
  } else {
    return handlerForExpress(options, arg1, arg2, arg3)
  }
}

async function handlerForKoa (options, ctx, next) {
  if (!typeIs(ctx.req, options.type)) {
    return next()
  }
  await readBSON(options, ctx.req, ctx.request)
  return next()
}

function handlerForExpress (options, req, res, next) {
  if (!typeIs(req, options.type)) {
    return next()
  }
  readBSON(options, req, req).then(next, next)
}

async function readBSON (options, req, hostObj) {
  hostObj.body = {}
  if (options.rawbody) hostObj.rawbody = Buffer.from([])
  if (!typeIs.hasBody(req)) {
    return
  }
  getBody(req, {limit: options.limit}, Cb().pair)
  let rawBody = await Cb.pop()
  hostObj.body = options.bson.deserialize(rawBody)
  if (options.rawbody) hostObj.rawBody = rawBody
}

function isKoa (ctx) {
  // inspire by cabin, to check koa ctx
  // https://github.com/cabinjs/cabin/blob/master/src/index.js
  return isObject(ctx) && isObject(ctx.request)
}

function isObject (value) {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}
