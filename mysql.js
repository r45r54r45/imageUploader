import mysql from 'mysql';
import { q } from './sql';

const pool = mysql.createPool({
    connectionLimit: 100,
    host: '104.199.128.25',
    user: 'apiServer',
    password: 'shugazine2017!',
    database: 'shugazine',
    multipleStatements: true,
});

export function query() {
    const len = arguments.length;
    if (len === 1) {
        return new Promise((resolve, reject) => {
            pool.query(...q(arguments[0], []), (err, rows, fields) => {
                if (err){
                    reject(err);
                }
                resolve(rows);
            });
        });
    } else if (len === 2) {
        return new Promise((resolve, reject) => {
            pool.query(...q(arguments[0], arguments[1]), (err, rows, fields) => {
                if (err){
                    reject(err);
                }
                resolve(rows);
            });
        });
    }
}
export function queryEnd(){
    pool.end();
}