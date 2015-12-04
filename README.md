# hackaton

apiClient.js - клиент для API https://pre.russia.travel/apidoc/library/

Примеры вызова метода "Справочник сервисов объектов"
apiClient.getServices
```
apiClient.getServices().then((data) => {
    console.log(inspect(data, { colors: true, depth: Infinity }));
}).catch((err)=>{
    console.log('err', err);
});
```

В ответ получаем объект:
```
{ items: 
   [ { id: 'bilety', name: 'Билеты' },
     { id: 'bankomat', name: 'Банкомат' },
     { id: 'parikmakherskaya', name: 'Парикмахерская' },
     { id: 'obmen_valyuty', name: 'Обмен валюты' },
     { id: 'taksi', name: 'Такси' },
     { id: 'pochta', name: 'Почта' },
     { id: 'parking', name: 'Паркинг' },
     { id: 'wifi', name: 'wifi' },
     { id: 'kafe', name: 'Кафе' },
     { id: 'apteka', name: 'Аптека' },
     { id: 'uslugi_dlya_lyudey_s_ogranichennymi_vozmozhnostyami',
       name: 'Услуги для людей с ограниченными возможностями' },
     { id: 'tualet', name: 'Туалет' } ],
  responseCode: '200',
  responseMessage: 'Запрос успешен' }
```
