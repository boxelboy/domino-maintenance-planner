define(['app/collections/Base', 'app/models/resource_category'], function (Base, ResourceCategories) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/resource_categories',
        rel: 'api:resource_categories',
        model: ResourceCategories
    });
});