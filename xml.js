import fs from 'fs';
import { inspect } from 'util';
import parse from 'xml-parser';
import parser from 'xml2json';

import { createItemsWithFields, createItemWithPageInfo } from './apiObjectsFactory';

//let xml = fs.readFileSync('getGroupObjectTypes.xml', 'utf8');
//let xml = fs.readFileSync('getObjectTypes.xml', 'utf8');
//let xml = fs.readFileSync('getRegion.xml', 'utf8');
//let xml = fs.readFileSync('getArea_9972_1.xml', 'utf8');
//let xml = fs.readFileSync('getRegionGeoLocal_9972_278151_1.xml', 'utf8');
//let xml = fs.readFileSync('getServices.xml', 'utf8');
let xml = fs.readFileSync('findObjects.xml', 'utf8');


let data = parser.toJson(xml);
data = JSON.parse(data);

var items = data.response.items.item;

//var res = createItemsWithFields(data, ['id','name','group']);
//var res = createItemsWithFields(data, ['id','code','name']);
//var res = createItemsWithFields(data, ['id','code','name','type','region']);
var res = createItemsWithFields(data, ['id','name','group','geo','image','telephone','addressCountry','addressRegion','streetAddress','photos','published']);
console.log(inspect(res.items[0], { colors: true, depth: Infinity }));
console.log('res.items.length', res.items.length);
//console.log(inspect(data.response.items.item[0], { colors: true, depth: Infinity }));
//console.log(data.response.items.item[0].name.text['$t']);

//items.forEach((itemData)=>{
//    var item = composeItem(itemData);
//    //if (!item.group)
//    //    console.log(item);
//});

function composeItem(itemData) {
    var item = {};
    fillItem(item, itemData);
    fillGroups(item, itemData);
    return item;
}

function fillItem(src, itemData) {
    return Object.assign(src, {
        id: itemData.id,
        nid: itemData.nid,
        name: itemData.name[0]
    });
}

function fillGroups(src, itemData) {
    return Object.assign(src, {
        group: itemData.groups ? itemData.groups.group : null
    });
}