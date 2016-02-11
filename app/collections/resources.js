define(['app/collections/Base', 'app/models/resource'], function (Base, Resource) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/resources',
        rel: 'api:resources',
        model: Resource
    });
});