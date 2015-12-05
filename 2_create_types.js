import { inspect } from 'util';
import fs from 'fs';
import apiClient from './apiClient';

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
        fs.writeFileSync('2_suggest_types.json', JSON.stringify(types), 'utf8');

        fs.writeFileSync('2_suggest_groups_types.json', JSON.stringify(groups), 'utf8');

        var all = groups.concat(types);
        all = all.map((i)=>{return{label:i.name, value:i.groups}});
        fs.writeFileSync('2_suggest_all.json', JSON.stringify(all), 'utf8');

        //console.log(inspect(groups, { colors: true, depth: Infinity }));

        //console.log(inspect(data, { colors: true, depth: Infinity }));
    });

    //fs.writeFileSync('2_groups_types.json', JSON.stringify(groups), 'utf8');
});


