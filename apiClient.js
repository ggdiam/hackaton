import parser from 'xml2json';
import { inspect } from 'util';
//import { md5 } from 'blueimp-md5'
import http from 'superagent';
import fs from 'fs';

import { createItemsWithFields } from './objectsFactory';
//import { rosTravelApi } from '../config';
var rosTravelApi = 'http://api.russia.travel';

const REQ_HEAD = `<?xml version="1.0" encoding="UTF-8"?>`;

//api
//https://pre.russia.travel/apidoc/library/
const apiClient = {
    //Справочник типов объектов
    getObjectTypes: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'object-type')).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'nid', 'name', 'group']));
        }).catch(reject);
    }),

    //Справочник групп типов объектов
    getGroupObjectTypes: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'type-group')).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'nid', 'name', 'group']));
        }).catch(reject);
    }),

    //Справочник регионов для географической привязки
    getRegion: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressRegion')).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'code', 'name']));
        }).catch(reject);
    }),

    //Справочник районов географической привязки
    getArea: (region, page) => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressArea', `page="${page}" region="${region}"`)).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'code', 'name', 'type', 'region']));
        }).catch(reject);
    }),

    //Справочник объектов регионов географической привязки (города, поселки и др.)
    getAddressLocality: (region, area, page) => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressLocality', `page="${page}" region="${region}" area="${area}"`)).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'code', 'name', 'type', 'region', 'area']));
        }).catch(reject);
    }),

    //Справочник сервисов объектов
    getServices: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'services')).then((data)=> {
            resolve(createItemsWithFields(data, ['id', 'name']));
        }).catch(reject);
    }),

    findObjectsByTags: (objectTypes) => apiClient.findObjects(null, null, null, objectTypes),

    findObjectsByItemIds: (itemIds) => apiClient.findObjects(itemIds),

    findObjects: (itemIds, regionIds, point, objectTypes) => new Promise((resolve, reject)=> {
        apiClient.findObjects_withPages(itemIds, regionIds, point, objectTypes, 1)
            .then(resolve).catch(reject)
    }),

    findObjectsAllPages: (itemIds, regionIds, point, objectTypes) => new Promise((resolve, reject)=> {
        apiClient.findObjects_withPages(itemIds, regionIds, point, objectTypes, 1).then((data)=> {
            //console.log('findObjects_withPages');
            //console.log(inspect(data, { colors: true, depth: 1 }));

            var isMultiplePages = false;
            var curPage = 0;
            var totalPages = 0;
            if (data) {
                curPage = data.page;
                totalPages = data.totalPages;
                if (curPage < totalPages) {
                    isMultiplePages = true;
                }
            }


            if (isMultiplePages && data && data.items) {
                console.log('isMultiplePages, totalPages', totalPages);
                var outData = data;
                delete outData.page;
                delete outData.totalPages;

                var pageNum = 2;
                //запрос страниц
                getNextPage(outData, itemIds, regionIds, point, objectTypes, pageNum)
                    .then(()=>handleResults(outData, totalPages, itemIds, regionIds, point, objectTypes, pageNum, resolve));
            }
            else {
                resolve(data);
            }
        }).catch(reject)
    }),

    findObjects_withPages: (itemIds, regionIds, point, objectTypes, page) => new Promise((resolve, reject)=> {
        var itemIdsString = itemIds ? wrapItemIdTag(itemIds).join('\n') : '';
        var objectTypesString = objectTypes ? wrapIdTag(objectTypes).join('\n') : '';
        var regionIdsString = regionIds ? wrapIdTag(regionIds).join('\n') : '';

        getRequest(buildXmlRequestRaw(
            `\<request action="get-objects-for-update" lastupdate="30.04.2014" page="${page}">
<items>
${itemIdsString}
</items>
<addressRegion>
${regionIdsString}
</addressRegion>
${point ? `\<point radius="100">${point[0]},${point[1]}</point>` : ''}
<objectType>
${objectTypesString}
</objectType>
<attributes>
    <name/>
    <url/>
    <geo/>
    <types/>
    <photos/>
    <addressCountry/>
    <addressLocality/>
    <addressArea/>
    <addressRegion/>
    <streetAddress/>
</attributes>
</request>`
        )).then((data)=> {
            //resolve(data);
            resolve(createItemsWithFields(data, ['id', 'name', 'types', 'image', 'photos', 'url', 'addressCountry', 'addressRegion', 'streetAddress']));

            //resolve(createItemsWithFields(data, ['id','name','types','image','photos','url']));
            //resolve(createItemsWithFields(data, ['id','name','types','geo','image','telephone','addressCountry','addressRegion','streetAddress','photos','published']));
        }).catch(reject);
    })
};


/*
 <name/>
 <url/>
 <geo/>
 <types/>
 <addressCountry/>
 <addressLocality/>
 <addressArea/>
 <addressRegion/>
 <streetAddress/>
 <photos/>
 <review/>
 <videos/>
 <addressRegion/>
 <telephone/>
 <ratingValue/>
 <minPrice/>
 <maxPrice/>
 <priceRange/>
 <eventLinks/>
 <historyLinks/>
 <factsLinks/>
 <travelLinks/>
 <tostayLinks/>
 <factsLinks/>
 <showYandexPanorama/>
 <mediaFiles/>
 <panoramas/>
 */

//http request

function handleResults(outData, totalPages, itemIds, regionIds, point, objectTypes, pageNum, resolve) {
    //обновляем данные
    pageNum++;
    if (pageNum > totalPages) {
        resolve(outData);
    }
    else {
        getNextPage(outData, itemIds, regionIds, point, objectTypes, pageNum)
            .then(()=>handleResults(outData, totalPages, itemIds, regionIds, point, objectTypes, pageNum, resolve));
    }
}

function getNextPage(outData, itemIds, regionIds, point, objectTypes, pageNum) {
    console.log('getting page', pageNum);
    return new Promise((resolve)=> {
        apiClient.findObjects_withPages(itemIds, regionIds, point, objectTypes, pageNum)
            .then((data)=> {
                if (data && data.items) {
                    //добавляем данные
                    outData.items = outData.items.concat(data.items);
                    resolve();
                }
            }).catch((err)=> {
                //просто отдаем что было
                resolve();
            });
    })
}

function buildXmlRequest(action, type, more) {
    return `${REQ_HEAD}\n\<request action=\"${action}\" type=\"${type}\" ${more ? more : ''} \/\>`;
}

function buildXmlRequestRaw(raw) {
    return `${REQ_HEAD}\n${raw}`;
}

function getRequest(xml) {
    return new Promise((resolve, reject) => {
        var params = {
            //login: 'FB_839541212825123',
            login: 'view',
            hash: 'view',
            //hash: '',
            xml: xml
        };

        //console.log('request');
        //console.log(xml);
        //console.log('');
        //return;

        var reqObj = http
            .post(`${rosTravelApi}/`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(params);

        reqObj.end((err, res) => {
            if (err) {
                reject(err)
            }
            else {
                if (res && res.text) {
                    //fs.writeFile('findObjects.xml', res.text, (err)=>{});

                    let json = parser.toJson(res.text);
                    let data = JSON.parse(json);
                    //console.log(inspect(xml, {colors: true, depth: Infinity}));

                    resolve(data);
                }
                else {
                    resolve(null);
                }
            }
        });
    })
}

function wrapIdTag(list) {
    if (list) {
        list = list.map((item)=>`\<id>${item}</id>`);
        return list;
    }
    return '';
}

function wrapItemIdTag(list) {
    if (list) {
        list = list.map((itemId)=>`\<item id="${itemId}"/>`);
        return list;
    }
    return '';
}

export default apiClient;