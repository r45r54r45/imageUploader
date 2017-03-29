import fs from 'fs';
import Promise from 'bluebird';
import _ from 'underscore';
import {query, queryEnd} from './mysql';
import {GET_ALL_IMAGE_WITHOUT_IMAGE, UPDATE_MAIN_IMAGE_URL_ON_DB, UPDATE_DETAIL_IMAGE_URL_ON_DB} from './query';
import path from 'path';
const Storage = require('@google-cloud/storage')({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: path.join(__dirname, '../shugazine-60df3b2c8622.json'),
});

function uploadToServer(path, imageList, itemUID) {
    const bucketName = 'product-image-shugazine';
    const bucket = Storage.bucket(bucketName);
    console.log(path)
    function upload(absolutePath, imageIdentifier, bucket) {
        return new Promise((resolve, reject) => {
            let file = bucket.file(`${itemUID + '_' + imageIdentifier}`);
            fs.createReadStream(absolutePath)
                .pipe(file.createWriteStream({
                    gzip: true,
                    predefinedAcl: 'publicRead'
                }))
                .on('error', function (err) {
                    console.log(err);
                })
                .on('finish', function () {
                    // The file upload is complete.
                    file.getSignedUrl({
                        action: 'read',
                        expires: '03-17-2025',
                    })
                        .then(url => {
                            const fileNum = imageIdentifier.split('.')[0];
                            if (fileNum === '1') {
                                return query(UPDATE_MAIN_IMAGE_URL_ON_DB, [url, itemUID])
                            } else {
                                return query(UPDATE_DETAIL_IMAGE_URL_ON_DB(fileNum - 1), [url, itemUID])
                            }
                        })
                        .then(result => {
                            resolve(result);
                        })

                });
        });
    }

    return Promise.map(imageList, image => upload(path + '/' + image, image, bucket));
}


const readdir = Promise.promisify(fs.readdir);

function excludeDotStartingFile(list) {
    return list.filter(item => {
        return item[0] !== '.';
    })
}

function mapProductDirectoryToVendorItemCode(list) {
    const resultList = list.map(item => {
        const tempItemName = item.split('(')[1];
        if (!tempItemName) return null;
        return {
            dir: item,
            vendorItemCode: tempItemName.substring(0, tempItemName.length - 1)
        }
    })
    return _.compact(resultList);
}
function findProductDirectories(rootRoute) {
    return new Promise((resolve, reject) => {
        readdir(rootRoute)
            .then(result => {
                resolve(mapProductDirectoryToVendorItemCode(excludeDotStartingFile(result)));
            })
    });
}
function findImages(item, route) {
    return new Promise((resolve, reject) => {
        readdir(route)
            .then(result => {
                const imageList = excludeDotStartingFile(result);
                if (imageList.length === 0) {
                    resolve(null);
                } else if (_.indexOf(imageList,'notFinished') !== -1) {
                    resolve(null);
                } else {
                    resolve(_.extend(item, {
                        path: route,
                        imageList: imageList
                    }));
                }
            })
    });
}
function getWorkNeededItems() {
    return new Promise((resolve, reject) => {
        query(GET_ALL_IMAGE_WITHOUT_IMAGE)
            .then(result => {
                console.log(result)
                resolve(result.map(item => {
                    return {
                        itemUID: item.ITEM_UID,
                        vendorItemCode: item.VENDOR_NAME_CD + item.VENDOR_ITEM_CODE,
                        color: item.UPPER_COLOR_CD,
                        material: item.UPPER_MATERIAL_CD,
                        code: item.VENDOR_ITEM_CODE,
                    }
                }));
            })
    })
}

function getMatchingItemDir(productDirectories, workNeededItems) {
    const temp = workNeededItems.map(item => {
        console.log(productDirectories,item)
        const index = _.findIndex(productDirectories, product => {
            return product.vendorItemCode === item.vendorItemCode;
        });
        if (index !== -1) {
            return {
                dir: productDirectories[index].dir,
                item: Object.assign(item, {subDir: item.code + '_' + item.color + '_' + item.material})
            }
        } else {
            return false;
        }
    })
    return _.compact(temp);
}

/*
 조건

 product 와 item은 다르다
 product 안에 재질, 색이 다른 조합이 item 이다.
 */

Promise.all([
    findProductDirectories('/Volumes/pihome/Shugazine/상품이미지/상품이미지_17SS_최종'),
    getWorkNeededItems()
])
    .then(result => {
        const targetData = getMatchingItemDir(result[0], result[1]);
        //각 폴더로 들어가서 파일이 있는지 확인
        return Promise.map(targetData, item => findImages(item, '/Volumes/pihome/Shugazine/상품이미지/상품이미지_17SS_최종' + '/' + item.dir + "/" + item.item.subDir));
    })
    .then(temp => {
        const result = _.compact(temp);
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
        return Promise.map(result, item => uploadToServer(item.path, item.imageList, item.item.itemUID));
    })
    .then(result => {
        console.log(result);
        queryEnd();
    });