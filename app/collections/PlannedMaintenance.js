define(['app/collections/Base', 'app/models/PlannedMaintenance'], function (Base, PlannedMaintenance) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/planned_maintenance',
        rel: 'api:planned_maintenance',
        model: PlannedMaintenance
    });
});