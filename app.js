
import { inspect } from 'util';
import apiClient from './apiClient';

//import { md5 } from 'blueimp-md5'
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

