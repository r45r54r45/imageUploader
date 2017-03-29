export function q(sql, dataArr) {
  const query = [];
  query.push(sql);

  if (dataArr) {
    if (occurrences(sql, '?') == dataArr.length) {
        console.log("---------");
        console.log(sql);
        console.log(dataArr.toString());
        console.log("---------");
      query.push(dataArr);
    } else {
      throw new Error(`쿼리 파라미터 오류 \n ${sql}`);
    }
  }
  return query;
}

function occurrences(string, subString, allowOverlapping) {
  string += '';
  subString += '';
  if (subString.length <= 0) return (string.length + 1);

  let n = 0,
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
