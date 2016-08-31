define(['app/collections/Base', 'app/models/MaintenancePlanningAssets'], function (Base, MaintenancePlanningAssets) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/maintenance_planning_assets',
        rel: 'api:maintenance_planning_assets',
        model: MaintenancePlanningAssets
    });
});