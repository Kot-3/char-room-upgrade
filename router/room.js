'use strict'

const db = require('../db')
const record2svg = require('../utils/record2svg')
const express = require('express')
const router = express.Router()
const multer = require('multer');
const storage = multer.diskStorage({
  // 上传文件的目录
  destination: function (req, file, cb) {
    cb(null, 'status')
  },
  // 上传文件的名称
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// multer 配置
const upload = multer({
  storage
})

router.get('/@:roomId', (req, res) => {
  const roomList = req.app.get('roomList')
  const {
    roomId
  } = req.params
  const {
    title
  } = req.query

  res.render('room', {
    roomId,
    title,
    users: roomList[roomId] || []
  })
})

router.get('/@:roomId/record', async (req, res) => {
  const {
    roomId
  } = req.params
  const {
    limit = 100, offset = 0
  } = req.query

  const record = await db.getRecord(roomId, limit, offset)

  res.json(record)
})

router.get('/@:roomId/svg', async (req, res) => {
  const {
    roomId
  } = req.params
  let {
    width = 500, height = 300, limit = 20, theme = '', title = `${roomId}
  @chat.getloli.com: ~`, fontSize = '12'
  } = req.query

  limit = Math.floor(Math.abs(Math.min(limit, 100) || 20))

  const record = await db.getRecord(roomId, limit)

  const svg = record2svg({
    roomId,
    record,
    width: Math.abs(width),
    height: Math.abs(height),
    limit,
    theme,
    title,
    fontSize: Math.abs(fontSize)
  })

  res.set({
    'content-type': 'image/svg+xml',
    'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
  })

  res.send(svg)
})
router.post('/file_upload', upload.single('file'), (req, res) => {
  console.log(req);
  res.send({
    data: req.file
  })
})

module.exports = router