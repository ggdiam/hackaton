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
            break;
        case 'group':
            item[key] = itemData.groups ? itemData.groups.group : null;
            break;
        default:
            item[key] = itemData[key];
            break;
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