export function createItemsWithFields(data, fields) {
    var items = getRawItems(data);
    if (items) {
        var res = {};
        for(var key in data.response) {
            switch (key) {
                case 'items':
                    if (isArray(items)) {
                        var resItems = [];
                        items.map((itemData)=> {
                            var item = {};
                            fields.forEach((key)=> {
                                mapItem(itemData, key, item);
                            });
                            resItems.push(item);
                        });
                        res.items = resItems;
                    }
                    else {
                        var itemData = items;
                        var item = {};
                        fields.forEach((key)=> {
                            mapItem(itemData, key, item);
                        });
                        res.item = item;
                    }
                    break;
                default: res[key] = data.response[key]; break;
            }
        }
        return res;
    }
    return null;
}

export function createItemWithPageInfo(data, fields) {
    var itemData = getRawItems(data);
    if (itemData) {
        var res = {};
        for(var key in data.response) {
            switch (key) {
                case 'items':
                    var item = {};
                    fields.forEach((key)=> {
                        mapItem(itemData, key, item);
                    });
                    res.item = item;
                    break;
                default: res[key] = data.response[key]; break;
            }
        }
        return res;
    }
    return null;
}

function mapItem(itemData, key, item) {
    switch (key) {
        case 'name':
            item[key] = itemData.name[0];
            if (!item[key]) {
                fillTextField(itemData, key, item);
            }
            break;
        case 'types':
            item[key] = itemData[key] ? itemData[key].type: null;
            if (!isArray(item[key])) {
                item[key] = [item[key]];
            }
            break;
        case 'group':
            item[key] = itemData.groups ? itemData.groups.group : null;
            if (item[key]) {
                if (isArray(item[key])){
                    item[key] = item[key].map((i)=>{return i['$t']});
                }
                else {
                    item[key] = [item[key]['$t']];
                }
            }
            break;
        case 'photos':
            item[key] = itemData.photos ? itemData.photos.photo : null;
            break;
        case 'streetAddress':
            fillTextField(itemData, key, item);
            break;
        default:
            item[key] = itemData[key];
            break;
    }

    function fillTextField(itemData, key, item) {
        var text = itemData[key] ? itemData[key].text : null;
        if (text) {
            if (isArray(text)) {
                item[key] = text.length > 0 ? text[0]['$t'] : null;
            }
            else {
                item[key] = text['$t'];
            }
        }
    }
}

function getRawItems(data) {
    if (data && data.response && data.response.items && data.response.items.item) {
        return data.response.items.item;
    }
    return null;
}

function isArray(array) {
    if (Object.prototype.toString.call(array) === '[object Array]') {
        return true;
    }
    return false;
}