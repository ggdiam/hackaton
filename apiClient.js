import parse from 'xml-parser';
import { inspect } from 'util';
import { md5 } from 'blueimp-md5'
import config from './config';
import http from 'superagent';

const REQ_HEAD = `<?xml version="1.0" encoding="UTF-8"?>`;

//api
//https://pre.russia.travel/apidoc/library/
const apiClient = {
    //Справочник типов объектов
    getObjectTypes: () => getRequest(buildXmlRequest('get-library', 'object-type')),

    //Справочник групп типов объектов
    getGroupObjectTypes: () => getRequest(buildXmlRequest('get-library', 'type-group')),

    //Справочник регионов для географической привязки
    getRegion: () => getRequest(buildXmlRequest('get-library', 'addressRegion')),

    //Справочник районов географической привязки
    getRegionGeo: (region, page) => getRequest(buildXmlRequest('get-library', 'addressRegion', `page="${page}" region="${region}"`)),

    //Справочник объектов регионов географической привязки (города, поселки и др.)
    getRegionGeoLocal: (region, area, page) => getRequest(buildXmlRequest('get-library', 'addressLocality', `page="${page}" region="${region}" area="${area}"`)),

    //Справочник сервисов объектов
    getServices: () => getRequest(buildXmlRequest('get-library', 'services')),
};

function buildReq(action, type, more) {
    return `<request action=\"${action}\" type=\"${type}\" ${more} />`;
}

function buildXmlRequest(action, type) {
    var request = buildReq(action, type);
    return `${REQ_HEAD}${request}`;
}

function getRequest(request) {
    return new Promise((resolve, reject) => {
        var params = {
            //login: 'FB_839541212825123',
            login: 'view',
            hash: 'view',
            //hash: '',
            //xml: `<?xml version="1.0" encoding="UTF-8"?>
            //    <request action="get-library" type="object-type" />`
            xml: buildXmlRequest(request)
        };

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
                    let xml = parse(res.text);
                    console.log(inspect(xml, {colors: true, depth: Infinity}));

                    resolve(xml);
                }
                else {
                    resolve(null);
                }
            }
        });
    })
}

export default apiClient;