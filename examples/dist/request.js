'use strict';

var sid = null;
var noop = function noop() {};
var count = 0;

function request(options) {
  var _options = clone(options);

  var _options$fail = options.fail,
      fail = _options$fail === undefined ? noop : _options$fail,
      _options$success = options.success,
      success = _options$success === undefined ? noop : _options$success,
      _options$header = options.header,
      header = _options$header === undefined ? {} : _options$header;


  return new Promise(function (resolve, reject) {
    getSid().then(function (sid) {
      header.sid = sid;

      options.success = function (res) {
        if (res.statusCode === 200 && res.data.success) {
          count = 0;
          success(res.data);
          resolve(res);
        } else if (res.data.code) {
          switch (res.data.code) {
            case 5001:
            // sid 空
            case 5002:
              // sid 无效
              count++;
              // 最多请求5次
              if (count <= 5) {
                clearSid();
                request(_options);
              } else {
                fail(res);
                reject(res);
              }
              break;

          }
        } else {
          fail(res);
          reject(res);
        }
      };

      options.fail = function (res) {
        fail(res);
        reject(res);
      };

      options.header = header;
      wx.request(options);
    }).catch(function (err) {
      fail(err);
      reject(err);
    });
  });
}

function uploadFile(options) {
  var _options$header2 = options.header,
      header = _options$header2 === undefined ? {} : _options$header2;


  return new Promise(function (resolve, reject) {

    // 已经是网络资源不上传
    if (options.filePath.indexOf('http') === 0) {
      return resolve(options.filePath);
    }

    getSid().then(function (sid) {
      header.sid = sid;

      options.success = function (res) {
        res.data = JSON.parse(res.data);
        if (res.statusCode === 200 && res.data.isSuccess) {
          resolve(res.data.content);
        } else {
          reject(res);
        }
      };

      options.header = header;

      wx.uploadFile(options);
    }, function (errMsg) {
      reject(errMsg);
    });
  });
}

function multiUploadFile(options) {
  var arr = options.filePaths.map(function (filePath) {
    var _options = clone(options);
    _options.filePath = filePath;
    return uploadFile(_options);
  });

  return Promise.all(arr);
}

// 获取sid
function getSid() {

  return new Promise(function (resolve, reject) {
    if (sid) {
      return resolve(sid);
    }
    var _sid = wx.getStorageSync('sid');
    if (_sid) {
      sid = _sid;
      resolve(sid);
    } else {
      wx.login({
        success: function success(res) {
          // 获取用户的openId
          wx.request({
            url: 'https://invoice.wuage-inc.com/userSession/get3rdSessionKey',
            data: {
              code: res.code
            },
            success: function success(res2) {
              if (res2.statusCode == 200 && res2.data.success) {
                sid = res2.data.content;
                wx.setStorageSync('sid', sid);
                resolve(sid);
              } else {
                reject(res2);
              }
            },
            fail: function fail(err) {
              reject(err);
            }
          });
        }
      });
    }
  });
}

// 清除sid
function clearSid() {
  sid = null;
  wx.setStorageSync('sid', null);
}

function clone(src) {
  var target = {};
  for (var key in src) {
    target[key] = src[key];
  }
  return target;
}

module.exports = request;
exports.getSid = getSid;
exports.clearSid = clearSid;
exports.uploadFile = uploadFile;
exports.multiUploadFile = multiUploadFile;