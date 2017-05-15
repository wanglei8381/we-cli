"use strict";

var app = getApp();

Page({
  data: {
    userInfo: {}
  },
  onLoad: function onLoad() {
    var that = this;
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      });
    });
  }
});