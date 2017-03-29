"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.q = q;
function q(sql, dataArr) {
  var query = [];
  query.push(sql);

  if (dataArr) {
    if (occurrences(sql, '?') == dataArr.length) {
      console.log("---------");
      console.log(sql);
      console.log(dataArr.toString());
      console.log("---------");
      query.push(dataArr);
    } else {
      throw new Error("\uCFFC\uB9AC \uD30C\uB77C\uBBF8\uD130 \uC624\uB958 \n " + sql);
    }
  }
  return query;
}

function occurrences(string, subString, allowOverlapping) {
  string += '';
  subString += '';
  if (subString.length <= 0) return string.length + 1;

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n;
}
//# sourceMappingURL=sql.js.map