import http from 'superagent';
import { inspect } from 'util';
import fs from 'fs';
import apiClient from './apiClient';


//deleteInnaLocationsWithOutRosTurizmItems();
//deleteTagsWithoutInnaLocationsItems();
//concatTypesWithLocations();
//locationNames();
//findDoubled();
//createLocationsJSON();


function createLocationsJSON() {
    var data = JSON.parse(fs.readFileSync('1_search_result_wo_empty_items.json', 'utf8'));
    console.log(data[0]);

    data = data.map((item)=>{
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            items: item.items.map((i)=>i.id)
        }
    });

    fs.writeFileSync('3_locations.json', JSON.stringify(data), 'utf8');
}

function findDoubled() {
    var data = JSON.parse(fs.readFileSync('2_suggest_tags_plus_locations_no_doubles.json', 'utf8'));
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


    fs.writeFileSync('2_suggest_tags_plus_locations_no_doubles.json', JSON.stringify(data), 'utf8');
}

function deleteInnaLocationsWithOutRosTurizmItems() {
    var innaLocations = JSON.parse(fs.readFileSync('1_search_result.json', 'utf8'));

    innaLocations = innaLocations.filter((l)=>{return l.items != null});
    fs.writeFileSync('1_search_result_wo_empty_items.json', JSON.stringify(innaLocations), 'utf8');
}


function deleteTagsWithoutInnaLocationsItems() {
    var innaLocations = JSON.parse(fs.readFileSync('1_search_result_wo_empty_items.json', 'utf8'));
//console.log(inspect(innaLocations[0], {colors: true, depth: Infinity}));

//console.log(innaLocations.length);
//console.log(innaLocations.filter((l)=>{return l.items != null}).length);



    var all = JSON.parse(fs.readFileSync('2_suggest_all.json', 'utf8'));
//console.log(inspect(all, { colors: true, depth: 2 }));

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

    console.log(all.filter((i)=>i.value.length == 0).length);


    fs.writeFileSync('2_suggest_all_filtered.json', JSON.stringify(all), 'utf8');
}

function concatTypesWithLocations() {
    var all = JSON.parse(fs.readFileSync('2_suggest_all_filtered.json', 'utf8'));
    //label, value
    //console.log(all[0]);

    var innaLocations = JSON.parse(fs.readFileSync('1_search_result_wo_empty_items.json', 'utf8'));
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

    fs.writeFileSync('2_suggest_tags_plus_locations.json', JSON.stringify(all), 'utf8');
}

function locationNames() {
    var innaLocations = JSON.parse(fs.readFileSync('1_search_result_wo_empty_items.json', 'utf8'));
    //name, items
    innaLocations = innaLocations.map((l)=>{
        return {
            label: l.name,
        }
    });
    //console.log(inspect(innaLocations[0], {colors: true, depth: Infinity}));

    fs.writeFileSync('2_location_names.json', JSON.stringify(innaLocations), 'utf8');
}