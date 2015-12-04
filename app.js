
import fs from 'fs';
import parse from 'xml-parser';
import { inspect } from 'util';
import { md5 } from 'blueimp-md5'
import { api } from './config';

import request from 'superagent';

let xml = fs.readFileSync('test.xml', 'utf8');
let obj = parse(xml);
//console.log(inspect(obj, { colors: true, depth: Infinity }));

//console.log(obj.root);

//console.log(md5('asdasdasdasd'));

var params = {
    login: 'xmltest',
    password: '',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
        <request action="get-library" type="object-type" />`
};

var reqObj = request
    .post(`${api}/`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send(params);
    //.accept('application/json');

reqObj.end((err, res) => {
    //console.log('err', err, 'res', res.text);
    let xml = parse(res.text);
    console.log(inspect(xml, { colors: true, depth: Infinity }));
});