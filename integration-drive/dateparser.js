action.numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

action.parseDateString = function (dateStr) {
    var date = new Date();
    function _doFormat(toFormat) {
        return toFormat.getFullYear() + "/" + (toFormat.getMonth() + 1) + "/" + toFormat.getDate();
    }
    switch (dateStr) {
        case "today":
            return _doFormat(date);
        case "tomorrow":
            console.log("Tomorrow!");
            date.setDate(date.getDate() + 1);
            return _doFormat(date);
        case "next week":
        case "nextweek":
            date.setDate(date.getDate() + 7);
            return _doFormat(date);
        case "nextmonth":
        case "next month":
            //Let moment.js handle the +1 month
            var momentDate = moment(date);
            momentDate.month(momentDate.month() + 1);
            return _doFormat(momentDate.toDate());
    }
    
    dateStr = dateStr.toLowerCase().trim().replace("in a ", "in 1").replace("a day", "1 day").replace("a week", "1 week").replace("a month", "1 month");
    for (var i = (action.numbers.length - 1); i >= 0; i--) {
        dateStr = dateStr.replace(action.numbers[i], i);
    }
    dateStr = dateStr.replace(/d$/, " day").replace(/w$/, " week").replace(/m$/, " month");
    if (dateStr.match(/^(in )?\d*( )?day(s)?( from now)?( from today)?$/) !== null) {
        var daysFromNow = dateStr.split(" day")[0].split(" ");
        daysFromNow = parseInt(daysFromNow[daysFromNow.length - 1]);
        date.setDate(date.getDate() + daysFromNow);
        return _doFormat(date);
    }
    if (dateStr.match(/^(in )?\d*( )?week(s)?( from now)?( from today)?( from this week)?$/) !== null) {
        var daysFromNow = dateStr.split(" week")[0].split(" ");
        daysFromNow = parseInt(daysFromNow[daysFromNow.length - 1]) * 7;
        date.setDate(date.getDate() + daysFromNow);
        return _doFormat(date);
    }
    if (dateStr.match(/^(in )?\d*( )?month(s)?( from now)?( from today)?( from this week)?$/) !== null) {
        var monthsFromNow = dateStr.split(" month")[0].split(" ");
        monthsFromNow = parseInt(monthsFromNow[monthsFromNow.length - 1]);
        console.log(monthsFromNow);
        date.setMonth(date.getMonth() + monthsFromNow);
        return _doFormat(date);
    }

    if (dateStr === null) {
        return dateStr;
    }
    if (dateStr.split('/').length === 1 && !isNaN(parseInt(dateStr))) {
        //It's just a number, interpret as day of month if btw 1 & 31, ignore if anything else
        var num = parseInt(dateStr);
        if (num > 1 && num <= 31) {
            date.setDate(num);
            return _doFormat(date);
        } else {
            return null;
        }
    }
    if (dateStr.split('/').length === 2) {
        //MM/dd
        var month = parseInt(dateStr.split('/')[0]);
        var day = parseInt(dateStr.split('/')[1]);
        if (isNaN(month) || isNaN(day)) {
            return null;
        }
        if (month <= 12 && month >= 1 && day >= 1 && day <= 31) {
            return (new Date()).getFullYear() + "/" + month + "/" + day;
        }
        if (month.toString().length === 4 && day <= 12 && day >= 1) {
            //the month is a year, and the day is a month
            return month + "/" + day + "/1";
        }
        return null;
    }
    if (dateStr.split('/').length === 3) {
        //Year/Month/Day or Month/Day/Year
        var split = dateStr.split('/');
        split[0] = parseInt(split[0]);
        split[1] = parseInt(split[1]);
        split[2] = parseInt(split[2]);
        if (isNaN(split[0]) || isNaN(split[1]) || isNaN(split[2])) {
            return null;
        }

        if (split[0].toString().length === 4) {
            var year = split[0];
            if (split[1] >= 1 && split[1] <= 12) { //Y/m/d
                var month = split[1];
                if (split[2] >= 1 && split[2] <= 31) {
                    var day = split[2];
                    return year + "/" + month + "/" + day;
                }
            }
            if (split[1] >= 1 && split[1] <= 31) { //Year/day/month
                var day = split[1];
                if (split[2] >= 1 && split[2] <= 12) {
                    var month = split[2];
                    return year + "/" + month + "/" + day;
                }
            }
            return null;
        }

        if (split[0] >= 1 && split[0] <= 12) {
            var month = split[0];
            if (split[1] >= 1 && split[1] <= 31) { //M/d/y
                var day = split[1];
                if (split[2].toString().length === 4) {
                    var year = split[2];
                    return year + "/" + month + "/" + day;
                }
                if (split[2].toString().length === 2) {
                    var year = 2000 + year;
                    return year + "/" + month + "/" + day;
                }
            }
        }
    }
    return null;
};