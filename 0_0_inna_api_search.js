import http from 'superagent';
import { inspect } from 'util';
import fs from 'fs';

//const IN_DATA_FILE = '0_1_data.txt';
//const INNA_LOCATIONS = '0_2_inna_locations.txt';
import { IN_DATA_FILE, INNA_LOCATIONS } from './0_0_0_file_names';

//continueFromIndex();

createFileIfNotExists(INNA_LOCATIONS);
readLocationsDataFromFile();


function createFileIfNotExists(fileName) {
    try {
        fs.statSync(fileName);
        console.log(`file ${fileName} exists`);
    }
    catch(e) {
        fs.writeFileSync(fileName, '', 'utf8');
        console.log(`file ${fileName} created`);
    }
}

function continueFromIndex() {
    var data = fs.readFileSync(INNA_LOCATIONS, 'utf8');
    if (data) {
        var list = data.split('\n');
        var fromIndex = list.length - 1;
        fromIndex = fromIndex < 0 ? 0 : fromIndex;
        console.log('continue from index', fromIndex);
        return fromIndex;
    }

    console.log('continue from index', 0);
    return 0;
}

function readLocationsDataFromFile() {
    var data = fs.readFileSync(IN_DATA_FILE, 'utf8');
    var list = data.split('\n');

    console.log('len', list.length);

    processIndex(continueFromIndex());

    function processIndex(i) {
        if (!list[i]) {
            return;
        }

        var locData = list[i].split('\t');
        if (!locData) {
            return;
        }
        //console.log(locData);

        var id = locData[0];
        var name = locData[1];
        var lat = locData[2];
        var long = locData[3];

        console.log('processing item', i, id, name);

        if (i > 100000) {
            return;
        }

        processLocation(id, name, lat, long, ()=>{
            processIndex(i+1);
        });
    }
}

function processLocation(id, name, lat, long, runNextCallback) {
    var time = +(new Date());
    var reqObj = http
        .get(`https://inna.ru/api/v1/Packages/SearchHotels?StartVoyageDate=2016-02-15&EndVoyageDate=2016-02-22&AddFilter=true&Adult=2&ArrivalId=${id}&DepartureId=6733&TicketClass=0`)
        .end((err, res) => {
            if (err) {
                console.log('error processing', name);
                saveLocationItem(id, name, lat, long, null, null, null, time, runNextCallback);
            }
            else {
                //console.log(inspect(res.body, { colors: true, depth: 2 }));
                if (res && res.body) {
                    var data = res.body;

                    var price = data && data.RecommendedPair && data.RecommendedPair.Hotel && data.RecommendedPair.Hotel.PackagePrice ? data.RecommendedPair.Hotel.PackagePrice : null;
                    //console.log('RecommendedPair.Hotel.PackagePrice', data.RecommendedPair.Hotel.PackagePrice);
                    var hotelsCount = data.HotelCount;
                    var ticketsCount = data.TicketCount;

                    saveLocationItem(id, name, lat, long, price, hotelsCount, ticketsCount, time, runNextCallback);

                    //fs.writeFile('findObjects.xml', res.text, (err)=>{});
                    //
                    //let json = parser.toJson(res.text);
                    //let data = JSON.parse(json);
                    ////console.log(inspect(xml, {colors: true, depth: Infinity}));
                    //
                    //resolve(data);
                }
                else {
                    console.log('null result');
                    saveLocationItem(id, name, lat, long, null, null, null, time, runNextCallback);
                    //resolve(null);
                }
            }
        });
}

function saveLocationItem(id, name, lat, long, price, hotelsCount, ticketsCount, time, runNextCallback) {
    var item = {
        id,
        name,
        lat,
        long,
        price,
        hotelsCount,
        ticketsCount
    };
    //console.log('saving item', inspect(item, { colors: true, depth: Infinity }));
    console.log('saving item', id, name, price, hotelsCount, ticketsCount);

    //if (fs.)
    fs.appendFileSync(INNA_LOCATIONS, JSON.stringify(item)+'\n', 'utf8');

    var doneIn = +(new Date()) - time;
    console.log('done in', doneIn, 'ms');
    console.log('');

    runNextCallback();
}
