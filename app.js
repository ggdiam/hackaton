import parser from 'xml2json';
import { inspect } from 'util';
import apiClient from './apiClient';

//import { md5 } from 'blueimp-md5'
//console.log(md5('asdasdasdasd'));

//apiClient.getObjectTypes().then((data)=>{
//apiClient.getGroupObjectTypes().then((data)=>{
//apiClient.getRegion().then((data)=>{
//apiClient.getArea(9972, 1).then((data)=>{
//apiClient.getAddressLocality(9972, 278151, 1).then((data)=>{
//apiClient.getAddressLocality(10518, 277198, 1).then((data)=>{
//apiClient.getServices().then((data)=>{
apiClient.findObjects().then((data)=>{
    console.log(inspect(data, { colors: true, depth: Infinity }));

}).catch((err, res)=>{
    //console.log(inspect(err.response.res.text, { colors: true, depth: 1 }));
    console.log('err', err.status);
    //var errObj = JSON.parse(parser.toJson(err.response.res.text));
    //console.log('err', errObj);
    console.log('err', err.response.res.text);
});

