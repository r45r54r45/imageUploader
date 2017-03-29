'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _mysql = require('./mysql');

var _query = require('./query');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Storage = require('@google-cloud/storage')({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: _path2.default.join(__dirname, '../shugazine-60df3b2c8622.json')
});

function uploadToServer(path, imageList, itemUID) {
    var bucketName = 'product-image-shugazine';
    var bucket = Storage.bucket(bucketName);
    console.log(path);
    function upload(absolutePath, imageIdentifier, bucket) {
        return new _bluebird2.default(function (resolve, reject) {
            var file = bucket.file('' + (itemUID + '_' + imageIdentifier));
            _fs2.default.createReadStream(absolutePath).pipe(file.createWriteStream({
                gzip: true,
                predefinedAcl: 'publicRead'
            })).on('error', function (err) {
                console.log(err);
            }).on('finish', function () {
                // The file upload is complete.
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-17-2025'
                }).then(function (url) {
                    var fileNum = imageIdentifier.split('.')[0];
                    if (fileNum === '1') {
                        return (0, _mysql.query)(_query.UPDATE_MAIN_IMAGE_URL_ON_DB, [url, itemUID]);
                    } else {
                        return (0, _mysql.query)((0, _query.UPDATE_DETAIL_IMAGE_URL_ON_DB)(fileNum - 1), [url, itemUID]);
                    }
                }).then(function (result) {
                    resolve(result);
                });
            });
        });
    }

    return _bluebird2.default.map(imageList, function (image) {
        return upload(path + '/' + image, image, bucket);
    });
}

var readdir = _bluebird2.default.promisify(_fs2.default.readdir);

function excludeDotStartingFile(list) {
    return list.filter(function (item) {
        return item[0] !== '.';
    });
}

function mapProductDirectoryToVendorItemCode(list) {
    var resultList = list.map(function (item) {
        var tempItemName = item.split('(')[1];
        if (!tempItemName) return null;
        return {
            dir: item,
            vendorItemCode: tempItemName.substring(0, tempItemName.length - 1)
        };
    });
    return _underscore2.default.compact(resultList);
}
function findProductDirectories(rootRoute) {
    return new _bluebird2.default(function (resolve, reject) {
        readdir(rootRoute).then(function (result) {
            resolve(mapProductDirectoryToVendorItemCode(excludeDotStartingFile(result)));
        });
    });
}
function findImages(item, route) {
    return new _bluebird2.default(function (resolve, reject) {
        readdir(route).then(function (result) {
            var imageList = excludeDotStartingFile(result);
            if (imageList.length === 0) {
                resolve(null);
            } else if (_underscore2.default.indexOf(imageList, 'notFinished') !== -1) {
                resolve(null);
            } else {
                resolve(_underscore2.default.extend(item, {
                    path: route,
                    imageList: imageList
                }));
            }
        });
    });
}
function getWorkNeededItems() {
    return new _bluebird2.default(function (resolve, reject) {
        (0, _mysql.query)(_query.GET_ALL_IMAGE_WITHOUT_IMAGE).then(function (result) {
            console.log(result);
            resolve(result.map(function (item) {
                return {
                    itemUID: item.ITEM_UID,
                    vendorItemCode: item.VENDOR_NAME_CD + item.VENDOR_ITEM_CODE,
                    color: item.UPPER_COLOR_CD,
                    material: item.UPPER_MATERIAL_CD,
                    code: item.VENDOR_ITEM_CODE
                };
            }));
        });
    });
}

function getMatchingItemDir(productDirectories, workNeededItems) {
    var temp = workNeededItems.map(function (item) {
        console.log(productDirectories, item);
        var index = _underscore2.default.findIndex(productDirectories, function (product) {
            return product.vendorItemCode === item.vendorItemCode;
        });
        if (index !== -1) {
            return {
                dir: productDirectories[index].dir,
                item: Object.assign(item, { subDir: item.code + '_' + item.color + '_' + item.material })
            };
        } else {
            return false;
        }
    });
    return _underscore2.default.compact(temp);
}

/*
 조건

 product 와 item은 다르다
 product 안에 재질, 색이 다른 조합이 item 이다.
 */

_bluebird2.default.all([findProductDirectories('/Volumes/pihome/Shugazine/상품이미지/상품이미지_17SS_최종'), getWorkNeededItems()]).then(function (result) {
    var targetData = getMatchingItemDir(result[0], result[1]);
    //각 폴더로 들어가서 파일이 있는지 확인
    return _bluebird2.default.map(targetData, function (item) {
        return findImages(item, '/Volumes/pihome/Shugazine/상품이미지/상품이미지_17SS_최종' + '/' + item.dir + "/" + item.item.subDir);
    });
}).then(function (temp) {
    var result = _underscore2.default.compact(temp);
    /*
     { dir: '002.샤모니_에나멜미들힐로퍼(BL340)',
     item:
     { itemUID: '1000000016',
     vendorItemCode: 'BL340',
     color: 'WH0',
     material: 'PUPT',
     code: '340',
     subDir: '340_WH0_PUPT' },
     path: '/Volumes/pihome/Shugazine/상품이미지/상품이미지_17SS_최종/002.샤모니_에나멜미들힐로퍼(BL340)/340_WH0_PUPT',
     imageList: [ '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.JPG' ] }
     */
    // 이 파일들을 서버로 보내기
    return _bluebird2.default.map(result, function (item) {
        return uploadToServer(item.path, item.imageList, item.item.itemUID);
    });
}).then(function (result) {
    console.log(result);
    (0, _mysql.queryEnd)();
});
//# sourceMappingURL=index.js.map