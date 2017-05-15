'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatNumber = formatNumber;
function formatNumber(n) {
  return String(n)[1] ? n : '0' + n;
}