import { inspect } from 'util';
import fs from 'fs';
import apiClient from './apiClient';

//const SUGGEST_TYPES_FILE = '2_1_suggest_types.json';
//const SUGGEST_GROUPS_FILE = '2_2_suggest_groups_types.json';
//const SUGGEST_ALL_FILE = '2_3_suggest_all.json';

import {
    SUGGEST_TYPES_FILE,
    SUGGEST_GROUPS_FILE,
    SUGGEST_ALL_FILE,
} from './0_0_0_file_names';

console.log('fetching types from api');
apiClient.getGroupObjectTypes().then((data)=>{
    var groups = data.items.map((item)=>{return {id:item.id, name:item.name}});
    //console.log(inspect(groups, { colors: true, depth: Infinity }));
    //id, name

    apiClient.getObjectTypes().then((data)=>{
        var types = data.items;
        //id, group

        groups.forEach((g)=>{
            g.groups = types.filter((t, ix)=>{
                return t.group && t.group.includes(g.id);
            });

            if (g.groups) {
                g.groups = g.groups.map((g)=>g.id);
            }
            //console.log(g);
        });

        groups = groups.map((g)=> {return {name: g.name, groups: g.groups}});
        groups = groups.filter((g)=>{return g.groups.length > 0});

        types = types.map((t)=>{return {name: t.name, groups: [t.id]}});

        fs.writeFileSync(SUGGEST_TYPES_FILE, JSON.stringify(types), 'utf8');
        console.log(SUGGEST_TYPES_FILE, 'saved');

        fs.writeFileSync(SUGGEST_GROUPS_FILE, JSON.stringify(groups), 'utf8');
        console.log(SUGGEST_GROUPS_FILE, 'saved');

        var all = groups.concat(types);
        all = all.map((i)=>{return{label:i.name, value:i.groups}});
        fs.writeFileSync(SUGGEST_ALL_FILE, JSON.stringify(all), 'utf8');
        console.log(SUGGEST_ALL_FILE, 'saved');

        //console.log(inspect(groups, { colors: true, depth: Infinity }));

        //console.log(inspect(data, { colors: true, depth: Infinity }));
    });

    //fs.writeFileSync('2_groups_types.json', JSON.stringify(groups), 'utf8');
});


