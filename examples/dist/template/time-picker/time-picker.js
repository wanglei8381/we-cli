'use strict';

//当前日期相关信息
var date = new Date();
var curYear = date.getFullYear();
var curMonth = date.getMonth() + 1;
var curDay = date.getDate();
var curHour = date.getHours();
var curMinute = date.getMinutes();

var nextMonth = curMonth == 12 ? 1 : curMonth + 1;

//picker数据信息
var months = [curMonth, nextMonth];
var days = [];
var hours = [];
var minutes = [];

function getDays(year, month) {
  days = [];
  month = parseInt(month, 10);
  var d = new Date(curYear, month, 0);
  var count = d.getDate();
  var start = month === curMonth ? curDay : 1;
  for (var i = start; i <= count; i++) {
    days.push(i);
  }
  return days;
}

getDays(curYear, curMonth);

function getHours(month, day) {
  hours = [];
  var start = 0;
  var isToday = month === curMonth && day === curDay;
  if (isToday) {
    start = curHour;
  }
  for (var i = start; i < 24; i++) {
    hours.push(i + '点');
  }
  if (isToday) {
    hours.unshift('现在');
  }
  return hours;
}

getHours(curMonth, curDay);

function getMinutes(hour) {
  minutes = [];
  if (hour == '现在') {
    return [];
  }
  for (var i = 0; i < 6; i++) {
    minutes.push(i * 10);
  }
  return minutes;
}

getMinutes('现在');

module.exports = {
  data: function data() {
    return {
      months: months,
      month: curMonth,
      days: days,
      day: curDay,
      hours: hours,
      hour: curHour + '点',
      minutes: minutes,
      minute: curMinute,
      // userInfo: {},
      showPicker: false,
      value: [0, 0, 0, 0]
    };
  },
  //页面事件处理函数
  bindChange: function bindChange(e) {
    console.log('--->changed');
    var oldVal = this.data.value;
    var val = e.detail.value;

    var oldMonth = months[oldVal[0]];

    var newMonth = months[val[0]];
    var newDay = days[val[1]];
    var newHour = hours[val[2]];

    this.setData({
      value: val
    });

    function getIndex() {
      var index = null;
      for (var i = 0; i < oldVal.length; i++) {
        if (oldVal[i] !== val[i]) {
          index = i;
          break;
        }
      }
      return index;
    }

    var index = getIndex();

    switch (index) {
      case 0:
        this.setData({
          days: getDays(curYear, newMonth),
          hours: getHours(newMonth, days[val[0]]),
          minutes: getMinutes(hours[val[0]]),
          value: [val[0], 0, 0, 0]
        });
        break;
      case 1:
        this.setData({
          hours: getHours(newMonth, newDay),
          minutes: getMinutes(hours[val[0]]),
          value: [val[0], val[1], 0, 0]
        });
        break;
      case 2:
        this.setData({
          minutes: getMinutes(newHour),
          value: [val[0], val[1], val[2], 0]
        });
        break;
      case 3:
        break;
    }
  },
  confirm: function confirm() {
    var val = this.data.value;
    this.setData({
      month: this.data.months[val[0]],
      day: this.data.days[val[1]],
      hour: this.data.hours[val[2]],
      minute: this.data.minutes[val[3]],
      showPicker: false
    });
  },
  cancel: function cancel() {
    this.setData({
      showPicker: false
    });
  },
  showTime: function showTime() {
    this.setData({
      showPicker: true
    });
  }
};