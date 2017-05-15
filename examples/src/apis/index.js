let request = require('../request')

// 获取验证码
exports.getIdentityCode = function (mobile) {
  return request({
    url: 'https://invoice.wuage-inc.com/car/getIdentityCode',
    data: {
      mobile
    }
  })
}

// 验证验证码
exports.checkIdentityCode = function (mobile, code) {
  return request({
    url: 'https://invoice.wuage-inc.com/car/checkIdentityCode',
    data: {
      mobile,
      code
    }
  })
}