"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var GET_ALL_IMAGE_WITHOUT_IMAGE = exports.GET_ALL_IMAGE_WITHOUT_IMAGE = "\n    select \n        ITEM_UID,\n        VENDOR_NAME_CD,\n        VENDOR_ITEM_CODE,\n        UPPER_COLOR_CD,\n        UPPER_MATERIAL_CD\n    from \n        TB_ITEM_MASTER\n    where \n        MAIN_IMAGE_URI = ''\n";

var UPDATE_MAIN_IMAGE_URL_ON_DB = exports.UPDATE_MAIN_IMAGE_URL_ON_DB = "\n    update \n        TB_ITEM_MASTER\n    set\n        MAIN_IMAGE_URI = ?\n    where\n        ITEM_UID = ?\n";
var UPDATE_DETAIL_IMAGE_URL_ON_DB = exports.UPDATE_DETAIL_IMAGE_URL_ON_DB = function UPDATE_DETAIL_IMAGE_URL_ON_DB(fileNum) {
    return function () {
        return "\n    update \n        TB_ITEM_MASTER\n    set\n        DETAIL_IMAGE" + fileNum + "_URI = ?\n    where\n        ITEM_UID = ?\n";
    }();
};
//# sourceMappingURL=query.js.map