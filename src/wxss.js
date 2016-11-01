module.exports = function (code) {
    return code.toString().replace(/([0-9])px/gm, '$1rpx');
};
