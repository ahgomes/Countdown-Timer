'use strict';

var date;
var x;
var title = document.querySelector('title');
var betaOpen = false;
var buttons = ['.btnB', '.btnE', '.btnH', '.btnD'];

function setCookie(cname,cvalue, exhrs) {
    var d = new Date();
    d.setTime(d.getTime() + (exhrs * 60 * 60 * 1000));
    var expires = 'expires=' + d.toGMTString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
}

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

function checkCookie() {
    var day = getCookie('dayType');
    if (day == '') {
        return 0;
    } else {
        return parseInt(day);
    }
}

function eraseCookie(name) {
    setCookie(name, '', -1);
}

window.load = dayStarted() ?  switchDay(checkCookie()) : title.innerHTML = 'School isn\'t open rn';

function switchDay(y) {
    if(betaOpen) toggleBeta();
    clearInterval(x);
    eraseCookie('dayType');
    if(dayStarted()) {
        buttonActivate(y);
        notify(y);
        setCookie('dayType', y, 7);
        wDay(y);
    }
    else notify(9);
}

function buttonActivate(g) {
    for (let i = 0; i < buttons.length; i++) {
        let b = document.querySelector(buttons[i]);
        if(i == g) {
            document.querySelector(buttons[i] + ' i').innerHTML = '&#xE425';
            b.classList.remove('inactive');
            b.classList.add('active');
        } else {
            document.querySelector(buttons[i] + ' i').innerHTML = '&#xE426';
            b.classList.remove('active');
            b.classList.add('inactive');
        }
    }

}

document.querySelector('.btnB').onclick = function(){
    switchDay(0);
};

document.querySelector('.btnE').onclick = function(){
    switchDay(1);
};

document.querySelector('.btnH').onclick = function(){
    notify(3);
};

document.querySelector('.btnD').onclick = function(){
    notify(3);
};

function dayStarted() {
    let d = new Date()
    var ctime = new CTime(d);
    return d.getDay() != 0 && d.getDay() != 6 && ctime.toNum() >= 7.45 && ctime.toNum() <= 14.49;
}

function notify(n) {
    var noteBox = document.querySelector('.notify');

    switch (n) {
        case 0:
            noteBox.innerHTML = 'Timer has been set to Block Schedule';
            break;
        case 1:
            noteBox.innerHTML = 'Timer has been set to E-Day';
            break;
        case 3:
            noteBox.innerHTML = 'Not Setup yet';
            break;
        case 9:
            noteBox.innerHTML = 'Sorry, School is not open right now';
            break;
        default:
    }

    noteBox.style.right = '24px';
    window.setTimeout(function(){
        noteBox.style.right = '-500px';
    }, 3000);
}

function wDay(daytype) {
    var day = {};
    var block = {
        bells: [7.45, 8.43, 8.47, 9.45, 9.49,
                10.47, 11.47, 12.45, 12.49, 13.47, 13.51, 14.49],
        types: ['', 'Bell', '', 'Bell', '',
                'Lunch', '', 'Bell', '', 'Bell', '']
    }

    var eday =  {
        bells: [7.45, 8.28, 8.32, 9.15, 9.19, 10.02, 10.06,
                10.49, 11.45, 12.28, 12.32, 13.15, 13.19, 14.02, 14.06, 14.49],
        types: ['', 'Bell', '', 'Bell', '', 'Bell', '',
                'Lunch', '', 'Bell', '', 'Bell', '', 'Bell', '']
    }

    switch(daytype) {
        case 0:
            day = block;
            break;
        case 1:
            day = eday;
            break;
        default:
            day = block;
    }

    var period = wPer(day);

    x = setInterval(function() {
        var ctime = new CTime(new Date());
        var timeLeft = new CTime(
            0,
            period.eop.min - ctime.min - (ctime.sec == 0 ? 0 : 1),
            ctime.sec == 0 ? 0 : 60 - ctime.sec
        );

        timeLeft.min = (timeLeft.min < 0) ?
            60 - ctime.min + period.eop.min - 1:
            (period.eop.hr > ctime.hr ? 60 - ctime.min + period.eop.min : timeLeft.min);

        var tabString = (timeLeft.min < 10 ? '0' : '') + timeLeft.min + ':' +
                        (timeLeft.sec < 10 ? '0' : '') + timeLeft.sec;

        var toSixty =  ((period.eop.hr * 60) + period.eop.min) - ((period.prev.hr * 60) + period.prev.min);
        var barLength = (timeLeft.min + timeLeft.sec / 100) / toSixty;
        barLength = (1 - barLength) * 1190;
        barLength = (barLength < 0) ? 0 : barLength;

        document.querySelector('.jz').style.width = barLength + 'px';

        if(period.eop == null && h > 12) {
            title.innerHTML = 'School is Over';
        } else if(period.eop == null && h < 12) {
            title.innerHTML = 'School hasn\'t started';
        } else {
            title.innerHTML = period.type + ' ' + tabString;
            document.querySelector('.displayTime').innerHTML = '<strong>' + period.type + '</strong>' + ' ' + tabString;
        }

        if (timeLeft.min == 0 && timeLeft.sec == 0) {
            clearInterval(x);
            wDay(daytype);
        }
    }, 1000);
}

function wPer(daylist) {
    var ctime = new CTime(new Date());
    if(ctime.toNum() < daylist.bells[0]) return null;
    for(let i = 0; i < daylist.bells.length; i++) {
        if (ctime.toNum() < daylist.bells[i]) {
            return {
                eop: CTimeFromNum(daylist.bells[i]),
                type: daylist.types[i - 1],
                prev: CTimeFromNum(daylist.bells[i - 1])
            }
        }
    }
    return null;
}

function CTime(a, b, c) {
    if(b === undefined && c === undefined) {
        this.hr  = a.getHours();
        this.min = a.getMinutes();
        this.sec = a.getSeconds();
    } else {
        this.hr = a;
        this.min = b;
        this.sec = c || 0;
    }

    this.toNum = function() {
        return this.hr + this.min / 100;
    }
}

function CTimeFromNum(num) {
    var m = Math.round(num * 100) % 100;
    var h = num - m / 100;
    return new CTime(h, m);
}

function toggleBeta() {
    var beta = document.querySelector('.beta');
    var box = document.querySelector('.betaBox').style;
    var back = document.querySelector('.betaBack').style;
    if(betaOpen) {
        box.opacity = '0';
        beta.removeAttribute('style');
        setTimeout(function() { box.display = 'none'; back.display = 'none'; }, 150);
        betaOpen = false;
    } else {
        box.display = 'block';
        back.display = 'block';
        setTimeout(function() {
            box.opacity = '1';
            beta.style.color = '#0ba6fb';
            beta.style.borderColor = '#0ba6fb';
        }, 50);
        betaOpen = true;
    }
}
