// 引入Promise
let Promise = require('es6-promise')
Promise.polyfill()
require('./page')
App({
  getUserInfo: function getUserInfo (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo);
    } else {
      //调用登录接口
      wx.login({
        success: function success (res1) {
          wx.getUserInfo({
            success: function success (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo);
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})
