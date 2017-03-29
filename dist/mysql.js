'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.query = query;
exports.queryEnd = queryEnd;

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _sql = require('./sql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var pool = _mysql2.default.createPool({
    connectionLimit: 100,
    host: '104.199.128.25',
    user: 'apiServer',
    password: 'shugazine2017!',
    database: 'shugazine',
    multipleStatements: true
});

function query() {
    var _arguments = arguments;

    var len = arguments.length;
    if (len === 1) {
        return new Promise(function (resolve, reject) {
            pool.query.apply(pool, _toConsumableArray((0, _sql.q)(_arguments[0], [])).concat([function (err, rows, fields) {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            }]));
        });
    } else if (len === 2) {
        return new Promise(function (resolve, reject) {
            pool.query.apply(pool, _toConsumableArray((0, _sql.q)(_arguments[0], _arguments[1])).concat([function (err, rows, fields) {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            }]));
        });
    }
}
function queryEnd() {
    pool.end();
}
//# sourceMappingURL=mysql.js.map