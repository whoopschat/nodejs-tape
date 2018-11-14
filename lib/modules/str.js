const moment = require('moment');

function formatDate(date, pattern) {
    pattern = pattern || 'YYYY-MM-DD HH:mm';
    return moment(date).format(pattern);
}

function substr(str, len) {
    return str.length > len ? str.substr(0, len) + '...' : str;
}

module.exports = {
    formatDate,
    substr,
}