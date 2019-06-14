if(!window.localStorage) {
    alert('此浏览器暂不支持存储数据到本地');
}
var ls = window.localStorage || '';
var daka = document.getElementById('daka');
var morning = document.getElementById('morning');
var night = document.getElementById('night');
var slip = document.getElementById('slip');
var lastMonth = document.getElementById('lastMonth');

var btnHelp = document.getElementById('btnHelp');
var btnReset = document.getElementById('btnReset');
var btnShowLastMonth = document.getElementById('btnShowLastMonth');
var BtnSlideUp = document.getElementById('BtnSlideUp');




// localStorage
var store = {
    get: function(key,noFormat){
        var data = ls[key];
        if(!data) return null;
        if(noFormat) return data;
        return JSON.parse(data);
    },
    set: function(key, data, noFormat){
        ls[key] = !noFormat ? JSON.stringify(data) : data;
    },
    clean: function(key){
        ls.removeItem(key);
    },
    cleanAll: function(){
        ls.clear();
    }
}
// 本地数据
var DATA_DAKA = 'DATA_DAKA';
var Data = {
    month: 0,
    lastMonth: {},
    thisMonth: {}
}
var DK = {
    daka: function(mn){
        var time = getTime();
        var date = getDate();
        if(!Data.thisMonth[date]){
           Data.thisMonth[date] = {};
        }
        Data.thisMonth[date][mn] = time;
        this.renderDakaDom(mn,time);
        this.updateData();
        if(mn == 'n'){
            this.dealTodayError(Data.thisMonth[date]);
        }
    },
    cancel: function(mn){
        this.renderDakaDom(mn,'');
        var date = getDate();
        if(Data.thisMonth[date]){
            Data.thisMonth[date][mn] = '';
        }
        this.updateData();
    },
    updateData: function(){
        this.renderThisMonthCL();
        store.set(DATA_DAKA,Data);
    },
    ifEnough: function(time1,time2){
        time1 = new Date('2000/1/1 '+time1+':00'); 
        time2 = new Date('2000/1/1 '+time2+':00');
        var time9 = new Date('2000/1/1 9:00:00');
        if(time1 < time9){
            time1 = time9;
        }
        return time2 - time1 >= 9 * 60 * 60 * 1000;
    },
    ifError: function(data){
        var error = false;
        if(!data.m || !data.n){
            error = true;
        }else{
            if(!this.ifEnough(data.m,data.n)){
                error = true;
            }
        }
        return error;
    },
    dealTodayError(data){
        var error = this.ifError(data);
        if(!data.n && new Date().getHours() <= 18){
            error = '';
        }
        error ? night.classList.add('error') : night.classList.remove('error');
    },
    renderDakaDom: function(mn,time){
        var target = document.getElementById(mn == 'm' ? 'morning' : 'night');
        target.innerHTML = time;
        time ? target.classList.add('active') : target.classList.remove('active');
    },
    renderToday: function(){
        var data = Data.thisMonth;
        var date = getDate();
        var m = '';
        var n = '';
        if(data[date]){
            m = data[date].m || '';
            n = data[date].n || '';
        }else{
            data[date] = {
                m: '',
                n: ''
            }
        }
        this.renderDakaDom('m',m);
        this.renderDakaDom('n',n);
        this.dealTodayError(data[date]);
    },
    renderThisMonthCL: function(){
        var date = new Date();
        this.renderCalLendar(date.getMonth() + 1,date.getFullYear(),Data.thisMonth,'thisMonthLog');
    },
    renderLastMonthCL: function(){
        // 从当前月获取上一月，可以自动跨年
        var today = new Date();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        var date = new Date(year+'/'+month+'/1 00:00:00').getTime() - 24*60*60*1000;
        date = new Date(date);

        this.renderCalLendar(date.getMonth() + 1,date.getFullYear(),Data.lastMonth,'lastMonthLog');
    },
    renderCalLendar: function(m,y,data,domid){
        // 周一-周日 1234560
        var firstDay = new Date(y+'/'+m+'/1 00:00:00').getDay();
        var preDay = firstDay == 0 ? 6 : firstDay - 1;
        var lastMonth = getLastDom(preDay);
        var _this = this;

        var daysCount = calDays(m,y);
        var thisMonth = getThisDom(daysCount,data,m,y);
        var arr = '一二三四五六日'.split('').map(function(item){
            return '<li class="title">'+item+'</li>';
        }).concat(lastMonth,thisMonth);

        document.getElementById(domid).innerHTML = arr.join('');

        function getLastDom(l) {
            var arr = []
            for (var i = 0; i < l; i++) {
                arr.push('<li class="lastMonthDay"></li>');
            }
            return arr;
        }
        function getThisDom(l,data,m,y) {
            var arr = [],hasMorning = '',hasNight = '',error='',ndata = {},date,dateS,noNeedData,today;
            for (var i = 1; i <= l; i++) {
                dateS = new Date(y+'/'+m+'/'+i+' 00:00:00');
                date = getDate(dateS);
                ndata = data[date] || {};
                hasMorning = ndata.m ? 'hasMorning' : '';
                hasNight = ndata.n ? 'hasNight' : '';
                error = _this.ifError(ndata) ? 'error' : '';
                noNeedData = '';
                today = '';
                if(!hasMorning && !hasNight){
                    // 无数据 周六日不需要打卡
                    // 无数据 在今天以后的不需要打卡
                    if([0,6].indexOf(dateS.getDay())>-1 || dateS - new Date() > 0){
                        error = '';
                        noNeedData = 'noNeedData';
                    }
                }
                if(new Date() >= dateS && new Date() - dateS <= 24 * 60 * 60 * 1000){
                    today = 'today';
                }
                if(!hasNight && today && new Date().getHours() <= 18){
                    error = '';
                }
                arr.push('<li class="'+[hasMorning,hasNight,error,noNeedData,today].join(' ')+'" data-date="'+date+'"><span>'+i+'</span><span class="m">'+(ndata.m || '')+'</span><span class="n">'+(ndata.n || '')+'</span></li>');
            }
            return arr;
        }
        function calDays(m,y){
            m = parseInt(m);
            y = parseInt(y);
            if(m == 2)return y % 4 == 0 ? 29 : 28;
            if([1,3,5,7,8,10,12].indexOf(m) > -1)return 31;
            return 30;
        }
    },
    showLog: function(){
        slip.classList.add('active');
    },
    hideLog: function(){
        slip.classList.remove('active');
        btnShowLastMonth.classList.remove('active');
        lastMonth.classList.add('hide');
    },
    reset: function(){
        store.cleanAll();
        window.location.reload();
        Data = {
            month: new Date().getMonth() + 1,
            lastMonth: {},
            thisMonth: {}
        }
        this.updateData();
        this.init();
    },
    showHelp: function(){
        var helpShow = store.get('help',true);
        if(!helpShow){
            alert('单击：打卡\n上划/下滑：显示/隐藏浮层');
            store.set('help',0,true);
        }
    },
    init: function(){
        this.showHelp();
        // 从缓存获取数据
        var cache = store.get(DATA_DAKA);
        if(cache){
            Data = cache;
        }
        // 月份切换 或者新数据时候
        // 将当前月数据保存到上月，并新建空数据
        var date = new Date();
        var month = date.getMonth() + 1;
        var lastMonth = month - 1 < 1 ? 12 : month - 1;
        if(month != Data.month){
            Data.month = month;
            Data.lastMonth = Data.thisMonth;
            Data.thisMonth = {};
            store.set(DATA_DAKA,Data);
        }
        document.getElementById('thisMonthTitle').innerHTML = month + '月';
        document.getElementById('lastMonthTitle').innerHTML = lastMonth + '月';
        // 渲染当前月份的日历
        this.renderThisMonthCL();
        this.renderLastMonthCL();
        // 渲染当天的打卡记录
        this.renderToday();
    }
}
// utils
function getDate(date) {
    var d = date || new Date();
    return [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
    ].map(function(item){
        return item < 10 ? '0' + item : item
    }).join('-')
}
function getTime(date) {
    var d = date || new Date();
    return [
        d.getHours(),
        d.getMinutes()
    ].map(function(item){
        return item < 10 ? '0' + item : item
    }).join(':')
}
// 早上还是晚上
function getMn(value){
    var h = value.split(':');
    return h <= 14 ? 'm' : 'n'
}
function on(curEle, type, fn) {
    curEle.addEventListener(type, fn);
}
function bind(){
    touch.on( morning, 'tap', function(){
        if(!morning.innerHTML){
            DK.daka('m');
        }
    })
    // touch.on( morning, 'doubletap swiperight', function(){
    //     DK.cancel('m');
    // })
    touch.on( night, 'tap', function(){
        DK.daka('n');
    })
    // touch.on( night, 'doubletap swiperight', function(){
    //     DK.cancel('n');
    // })
    // 隐藏收起浮层
    touch.on( document, 'swipedown', function(){
        DK.showLog()
    })
    touch.on( document, 'swipeup', function(){
        DK.hideLog()
    })
    touch.on( BtnSlideUp, 'tap', function(){
        DK.hideLog()
    })
    // 隐藏显示上月
    touch.on( btnShowLastMonth, 'tap', function(){
        btnShowLastMonth.classList.toggle('active');
        lastMonth.classList.toggle('hide');
    })
    // 重置
    touch.on( btnReset, 'tap', function(){
        window.confirm('重置会情况所有缓存数据\n请三思') && DK.reset();
    })
}

function init(){
    bind();
    DK.init();
}

init();