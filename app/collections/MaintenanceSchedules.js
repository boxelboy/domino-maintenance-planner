define(['app/collections/Base', 'app/models/MaintenanceSchedules'], function (Base, MaintenanceSchedules) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/maintenance_schedules',
        rel: 'api:maintenance_schedules',
        model: MaintenanceSchedules
    });
});