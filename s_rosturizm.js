import http from 'superagent';
import { inspect } from 'util';
import fs from 'fs';
import apiClient from './apiClient';

const IN_DATA_FILE = '1_search.txt';
const IN_DATA_FILTERED = '1_search_filtered.txt';
const OUT_DATA_FILE = '1_search_result.txt';
const JSON_DATA_FILE = '1_search_result.json';

//readLocationsDataFromFile();
//deleteNullPrice();
//fileToJson();


function fileToJson() {
    var data = fs.readFileSync(OUT_DATA_FILE, 'utf8');
    if (data) {
        var list = data.split('\n');
        //console.log(JSON.parse(list[0]));
        //return;

        list = list.map((i)=>i?JSON.parse(i):null);
        list = list.filter((i)=>i!=null);

        //var res = list.map((i)=>{
        //    try{
        //        if (i) {
        //            var item = JSON.parse(i);
        //        }
        //
        //        //console.log(item);
        //    }
        //    catch(err) {
        //        console.log(err);
        //        console.log(i);
        //    }
        //});

        fs.writeFileSync(JSON_DATA_FILE, JSON.stringify(list), 'utf8');
    }
}

function deleteNullPrice() {
    var data = fs.readFileSync(IN_DATA_FILE, 'utf8');
    if (data) {
        var list = data.split('\n');
        list.forEach((item)=>{
            if (item) {
                item = JSON.parse(item);
                if (item.price && item.lat && item.long && item.lat != 'NULL' && item.long != 'NULL') {
                    fs.appendFileSync(IN_DATA_FILTERED, JSON.stringify(item)+'\n', 'utf8');
                }
            }
        })
    }
}

function continueFromIndex() {
    var data = fs.readFileSync(OUT_DATA_FILE, 'utf8');
    if (data) {
        var list = data.split('\n');
        var fromIndex = list.length;
        console.log('continue from index', fromIndex);
        return fromIndex;
    }

    console.log('continue from index', 0);
    return 0;
}

function readLocationsDataFromFile() {
    var data = fs.readFileSync(IN_DATA_FILTERED, 'utf8');
    var list = data.split('\n');

    console.log('len', list.length);

    processIndex(continueFromIndex());

    function processIndex(i) {
        var loc = JSON.parse(list[i]);
        if (!loc) {
            return;
        }

        console.log('processing item', i, loc.id, loc.name);

        if (i > 1000) {
            return;
        }

        processLocation(loc, ()=>{
            processIndex(i+1);
        });
    }
}

function processLocation(loc, runNextCallback) {
    var time = +(new Date());

    apiClient.findObjects(null, null, [loc.lat,loc.long]).then((data)=>{
        //console.log('success, data', data);
        //console.log(inspect(data, { colors: true, depth: Infinity }));
        //console.log(inspect(data.response.items.item[1], { colors: true, depth: Infinity }));

        if (data && data.items) {
            loc.items = data.items.map((item)=>{
                return {
                    id: item.id,
                    name: item.name,
                    types: item.types
                }
            });
            loc.itemsCount = loc.items.length;
        }
        saveLocationItem(loc, time, runNextCallback);

    }).catch((err)=>{
        console.log('error', err);
        loc.objects = null;
        saveLocationItem(loc, time, runNextCallback);
    });
}


function saveLocationItem(loc, time, runNextCallback) {
    //console.log('saving item', inspect(item, { colors: true, depth: Infinity }));
    console.log('saving item', loc.id, loc.name, 'itemsCount', loc.itemsCount);

    fs.appendFileSync(OUT_DATA_FILE, JSON.stringify(loc)+'\n', 'utf8');

    var doneIn = +(new Date()) - time;
    console.log('done in', doneIn, 'ms');
    console.log('');

    runNextCallback();
}
