import http from 'superagent';
import { inspect } from 'util';
import fs from 'fs';
import apiClient from './apiClient';

//const LOCATION_PLACES_JSON = '1_3_location_places.json';
//const JSON_DATA_WO_EMPTY_ITEMS_FILE = '3_1_search_result_wo_empty_items.json';
//const SUGGEST_ALL_FILE = '2_3_suggest_all.json';
//const SUGGEST_ALL_FILTERED_FILE = '3_2_suggest_all_filtered.json';
//const SUGGEST_TAGS_PLUS_LOCATIONS = '3_3_suggest_tags_plus_locations.json';
//const LOCATION_NAMES = '3_4_location_names.json';
//const SUGGEST_TAGS_PLUS_LOCATIONS_NO_DOUBLES = '3_5_suggest_tags_plus_locations_no_doubles.json';
//const LOCATIONS = '3_6_locations.json';

import {
    LOCATION_PLACES_JSON,
    JSON_DATA_WO_EMPTY_ITEMS_FILE,
    SUGGEST_ALL_FILE,
    SUGGEST_ALL_FILTERED_FILE,
    SUGGEST_TAGS_PLUS_LOCATIONS,
    LOCATION_NAMES,
    SUGGEST_TAGS_PLUS_LOCATIONS_NO_DOUBLES,
    LOCATIONS
} from './0_0_0_file_names';


deleteInnaLocationsWithOutRosTurizmItems();
deleteTagsWithoutInnaLocationsItems();
concatTypesWithLocations();
locationNames();
findDoubled();
createLocationsJSON();

function deleteInnaLocationsWithOutRosTurizmItems() {
    console.log('');
    console.log('deleteInnaLocationsWithOutRosTurizmItems');
    var innaLocations = JSON.parse(fs.readFileSync(LOCATION_PLACES_JSON, 'utf8'));

    innaLocations = innaLocations.filter((l)=>{return l.items != null});
    fs.writeFileSync(JSON_DATA_WO_EMPTY_ITEMS_FILE, JSON.stringify(innaLocations), 'utf8');
    console.log('done, saved to', JSON_DATA_WO_EMPTY_ITEMS_FILE);
}

function deleteTagsWithoutInnaLocationsItems() {
    console.log('');
    console.log('deleteTagsWithoutInnaLocationsItems');
    var innaLocations = JSON.parse(fs.readFileSync(JSON_DATA_WO_EMPTY_ITEMS_FILE, 'utf8'));
    //console.log(inspect(innaLocations[0], {colors: true, depth: Infinity}));

    //console.log(innaLocations.length);
    //console.log(innaLocations.filter((l)=>{return l.items != null}).length);



    var all = JSON.parse(fs.readFileSync(SUGGEST_ALL_FILE, 'utf8'));
    //console.log(inspect(all, { colors: true, depth: 2 }));

    var initTagsCount = all.length;

    all.forEach((i)=> {
        var tags = i.value;

        i.value = tags.filter((tag, ix)=> {
            var tagFound = false;

            innaLocations.forEach((loc)=> {
                loc.items.forEach((locItem)=> {
                    if (locItem.types.includes(tag)) {
                        tagFound = true;
                    }
                })
            });

            if (tagFound) {
                return true;
            }
            else {
                console.log('delete', tag, 'from', i.label);
                return false;
            }
        });
    });

    console.log('empty tags count:', all.filter((i)=>i.value.length == 0).length);
    //берем теги с существующими категориями
    all = all.filter((i)=>i.value.length > 0);

    console.log('tags count', initTagsCount);
    console.log('tags count after filtering', all.length);

    fs.writeFileSync(SUGGEST_ALL_FILTERED_FILE, JSON.stringify(all), 'utf8');
    console.log('done, saved to', SUGGEST_ALL_FILTERED_FILE);
}

function concatTypesWithLocations() {
    console.log('');
    console.log('concatTypesWithLocations');
    var all = JSON.parse(fs.readFileSync(SUGGEST_ALL_FILTERED_FILE, 'utf8'));
    //label, value
    //console.log(all[0]);

    var innaLocations = JSON.parse(fs.readFileSync(JSON_DATA_WO_EMPTY_ITEMS_FILE, 'utf8'));
    //name, items
    innaLocations = innaLocations.map((l)=>{
        return {
            label: l.name,
            value: {
                locationId: l.id,//inna location id
                itemsIds: l.items.map((i)=>i.id) //ros travel item id
            }
        }
    });
    //console.log(inspect(innaLocations[0], {colors: true, depth: Infinity}));

    all = all.concat(innaLocations);

    fs.writeFileSync(SUGGEST_TAGS_PLUS_LOCATIONS, JSON.stringify(all), 'utf8');
    console.log('done, saved to', SUGGEST_TAGS_PLUS_LOCATIONS);
}

function locationNames() {
    console.log('');
    console.log('locationNames');
    var innaLocations = JSON.parse(fs.readFileSync(JSON_DATA_WO_EMPTY_ITEMS_FILE, 'utf8'));
    //name, items
    innaLocations = innaLocations.map((l)=>{
        return {
            label: l.name,
        }
    });
    //console.log(inspect(innaLocations[0], {colors: true, depth: Infinity}));

    fs.writeFileSync(LOCATION_NAMES, JSON.stringify(innaLocations), 'utf8');
    console.log('done, saved to', LOCATION_NAMES);
}

function findDoubled() {
    console.log('');
    console.log('findDoubled');
    var data = JSON.parse(fs.readFileSync(SUGGEST_TAGS_PLUS_LOCATIONS_NO_DOUBLES, 'utf8'));
    data = data.filter((item)=>{
        //console.log(item.label);

        var double = data.filter((i)=>i.label == item.label);
        if (double && double.length > 1) {
            console.log('дубли', item.label);
            double.forEach((d)=>{
                console.log(JSON.stringify(d.value));
            });
            console.log('');
            return false;
        }
        else {
            return true;
        }
    });


    fs.writeFileSync(SUGGEST_TAGS_PLUS_LOCATIONS_NO_DOUBLES, JSON.stringify(data), 'utf8');
    console.log('done, saved to', SUGGEST_TAGS_PLUS_LOCATIONS_NO_DOUBLES);
}

function createLocationsJSON() {
    console.log('');
    console.log('createLocationsJSON');
    var data = JSON.parse(fs.readFileSync(JSON_DATA_WO_EMPTY_ITEMS_FILE, 'utf8'));
    //console.log(data[0]);

    data = data.map((item)=>{
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            items: item.items.map((i)=>i.id)
        }
    });

    fs.writeFileSync(LOCATIONS, JSON.stringify(data), 'utf8');
    console.log('done, saved to', LOCATIONS);
}