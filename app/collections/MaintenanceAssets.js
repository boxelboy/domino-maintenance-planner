define(['app/collections/Base', 'app/models/MaintenanceAssets'], function (Base, MaintenanceAssets) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/assets',
        rel: 'api:assets',
        model: MaintenanceAssets
    });
});