define(['app/collections/Base', 'app/models/MaintenanceAssets'], function (Base, MaintenanceAssets) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/assets',
        rel: 'api:assets',
        model: MaintenanceAssets
    });
});