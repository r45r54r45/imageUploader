export const GET_ALL_IMAGE_WITHOUT_IMAGE = `
    select 
        ITEM_UID,
        VENDOR_NAME_CD,
        VENDOR_ITEM_CODE,
        UPPER_COLOR_CD,
        UPPER_MATERIAL_CD
    from 
        TB_ITEM_MASTER
    where 
        MAIN_IMAGE_URI = ''
`;

export const UPDATE_MAIN_IMAGE_URL_ON_DB = `
    update 
        TB_ITEM_MASTER
    set
        MAIN_IMAGE_URI = ?
    where
        ITEM_UID = ?
`;
export const  UPDATE_DETAIL_IMAGE_URL_ON_DB = (fileNum) => {
    return (() => {
        return `
    update 
        TB_ITEM_MASTER
    set
        DETAIL_IMAGE${fileNum}_URI = ?
    where
        ITEM_UID = ?
`
    })();
}

