import parser from 'xml2json';
import { inspect } from 'util';
import { md5 } from 'blueimp-md5'
import config from './config';
import http from 'superagent';
import fs from 'fs';

import { createItemsWithFields } from './apiObjectsFactory';

const REQ_HEAD = `<?xml version="1.0" encoding="UTF-8"?>`;

//api
//https://pre.russia.travel/apidoc/library/
const apiClient = {
    //Справочник типов объектов
    getObjectTypes: () => new Promise((resolve, reject)=>{
        getRequest(buildXmlRequest('get-library', 'object-type')).then((data)=>{
            resolve(createItemsWithFields(data, ['id','nid','name']));
        }).catch(reject);
    }),

    //Справочник групп типов объектов
    getGroupObjectTypes: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'type-group')).then((data)=> {
            resolve(createItemsWithFields(data, ['id','nid','name','group']));
        }).catch(reject);
    }),

    //Справочник регионов для географической привязки
    getRegion: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressRegion')).then((data)=> {
            resolve(createItemsWithFields(data, ['id','code','name']));
        }).catch(reject);
    }),

    //Справочник районов географической привязки
    getArea: (region, page) => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressArea', `page="${page}" region="${region}"`)).then((data)=> {
            resolve(createItemsWithFields(data, ['id','code','name','type','region']));
        }).catch(reject);
    }),

    //Справочник объектов регионов географической привязки (города, поселки и др.)
    getAddressLocality: (region, area, page) => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'addressLocality', `page="${page}" region="${region}" area="${area}"`)).then((data)=> {
            resolve(createItemsWithFields(data, ['id','code','name','type','region','area']));
        }).catch(reject);
    }),

    //Справочник сервисов объектов
    getServices: () => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequest('get-library', 'services')).then((data)=> {
            resolve(createItemsWithFields(data, ['id','name']));
        }).catch(reject);
    }),

    findObjects: (itemId, regionIds, point, objectTypes) => new Promise((resolve, reject)=> {
        getRequest(buildXmlRequestRaw(
`\<request action="get-objects-for-update" lastupdate="30.04.2014" page="1">
<items>
</items>
<addressRegion>
</addressRegion>
<point radius="100">43.585525,39.723062</point>
<objectType>
    <id>rostur_active</id>
</objectType>
<attributes>
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
</attributes>
</request>`
        )).then((data)=> {
            resolve(data);
            //resolve(createItemsWithFields(data, ['id','name']));
        }).catch(reject);
    })
};

//http request

function buildXmlRequest(action, type, more) {
    return `${REQ_HEAD}\n\<request action=\"${action}\" type=\"${type}\" ${more?more:''} \/\>`;
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

        console.log('request');
        console.log(xml);
        console.log('');
        //return;

        var reqObj = http
            .post(`${config.api}/`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(params);

        reqObj.end((err, res) => {
            if (err) {
                reject(err)
            }
            else {
                if (res && res.text) {
                    fs.writeFile('findObjects.xml', res.text, (err)=>{});

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

export default apiClient;