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
//apiClient.findObjects(132123, [234234], [43.58682600000,39.72014300000]).then((data)=>{
//apiClient.findObjects(null, null, [43.58682600000,39.72014300000]).then((data)=>{
apiClient.findObjects([290276,289907]).then((data)=>{
    console.log(inspect(data, { colors: true, depth: Infinity }));

}).catch((err, res)=>{
    //console.log(inspect(err.response.res.text, { colors: true, depth: 1 }));
    console.log('err', err.status);
    //var errObj = JSON.parse(parser.toJson(err.response.res.text));
    //console.log('err', errObj);
    console.log('err', err.response.res.text);
});



//https://inna.ru/api/v1/Packages/SearchHotels?AddFilter=true&Adult=2&ArrivalId=311&DepartureId=6733&EndVoyageDate=2015-12-27&StartVoyageDate=2015-12-21&TicketClass=0

//RecommendedPair.Hotel.PackagePrice - min цена

//https://inna.ru/#/packages/search/6733-311-21.12.2015-27.12.2015-0-2-

//id | name | lat long | price | linkToSearchResults [список объектов из api]