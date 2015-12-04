
import fs from 'fs';
import parse from 'xml-parser';
import { inspect } from 'util';
import { md5 } from 'blueimp-md5'
import config from './config';
import request from 'superagent';

import apiClient from './apiClient';

let xml = fs.readFileSync('test.xml', 'utf8');
let obj = parse(xml);
//console.log(inspect(obj, { colors: true, depth: Infinity }));

//console.log(obj.root);

//console.log(md5('asdasdasdasd'));

//apiClient.getObjectTypes().then((data)=>{
//apiClient.getGroupObjectTypes().then((data)=>{
//apiClient.getRegion().then((data)=>{
//apiClient.getRegionGeo(9972, 1).then((data)=>{
//apiClient.getRegionGeoLocal(9972, 278151, 1).then((data)=>{
apiClient.getServices().then((data)=>{
    console.log(inspect(data, { colors: true, depth: Infinity }));
}).catch((err)=>{
    console.log('err', err);
});

//var params = {
//    //login: 'FB_839541212825123',
//    login: 'view',
//    hash: 'view',
//    //hash: '',
//    //xml: `<?xml version="1.0" encoding="UTF-8"?>
//    //    <request action="get-library" type="object-type" />`
//    xml: `<?xml version="1.0" encoding="UTF-8"?>
//        <request action="get-objects-for-update" page="1" lastupdate="30.04.2014" deleted="Y" />`
//};
//
//var reqObj = request
//    .post(`${config.api}/`)
//    .set('Content-Type', 'application/x-www-form-urlencoded')
//    .send(params);
//    //.accept('application/json');
//
//reqObj.end((err, res) => {
//    //console.log('err', err, 'res', res.text);
//    let xml = parse(res.text);
//    console.log(inspect(xml, { colors: true, depth: Infinity }));
//});