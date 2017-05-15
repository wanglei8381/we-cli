let sid = null
let noop = ()=> {}
let count = 0

function request (options) {
  let _options = clone(options)

  let {
        fail = noop,
        success = noop,
        header = {}
      } = options

  return new Promise((resolve, reject) => {
      getSid().then((sid) => {
        header.sid = sid

        options.success = (res)=> {
          if (res.statusCode === 200 && res.data.success) {
            count = 0
            success(res.data)
            resolve(res)
          } else if (res.data.code) {
            switch (res.data.code) {
              case 5001:
              // sid 空
              case 5002:
                // sid 无效
                count++
                // 最多请求5次
                if (count <= 5) {
                  clearSid()
                  request(_options)
                } else {
                  fail(res)
                  reject(res)
                }
                break;

            }
          } else {
            fail(res);
            reject(res)
          }
        }

        options.fail = (res) => {
          fail(res)
          reject(res)
        }

        options.header = header
        wx.request(options)

      }).catch((err)=> {
        fail(err)
        reject(err)
      })
    }
  )
}

function uploadFile (options) {
  let {header = {}} = options

  return new Promise((resolve, reject) => {

    // 已经是网络资源不上传
    if (options.filePath.indexOf('http') === 0) {
      return resolve(options.filePath)
    }

    getSid().then((sid)=> {
      header.sid = sid

      options.success = (res)=> {
        res.data = JSON.parse(res.data)
        if (res.statusCode === 200 && res.data.isSuccess) {
          resolve(res.data.content)
        } else {
          reject(res)
        }
      }

      options.header = header

      wx.uploadFile(options)
    }, (errMsg)=> {
      reject(errMsg)
    })
  })
}

function multiUploadFile (options) {
  let arr = options.filePaths.map((filePath)=> {
    let _options = clone(options)
    _options.filePath = filePath
    return uploadFile(_options)
  })

  return Promise.all(arr)
}

// 获取sid
function getSid () {

  return new Promise((resolve, reject)=> {
    if (sid) {
      return resolve(sid)
    }
    let _sid = wx.getStorageSync('sid')
    if (_sid) {
      sid = _sid
      resolve(sid)
    } else {
      wx.login({
        success(res) {
          // 获取用户的openId
          wx.request({
            url: 'https://invoice.wuage-inc.com/userSession/get3rdSessionKey',
            data: {
              code: res.code
            },
            success: function (res2) {
              if (res2.statusCode == 200 && res2.data.success) {
                sid = res2.data.content
                wx.setStorageSync('sid', sid)
                resolve(sid)
              } else {
                reject(res2)
              }
            },
            fail: function (err) {
              reject(err);
            }
          })
        }
      })
    }
  })
}

// 清除sid
function clearSid () {
  sid = null
  wx.setStorageSync('sid', null)
}

function clone (src) {
  let target = {}
  for (let key in src) {
    target[key] = src[key]
  }
  return target
}

module.exports = request
exports.getSid = getSid
exports.clearSid = clearSid
exports.uploadFile = uploadFile
exports.multiUploadFile = multiUploadFile