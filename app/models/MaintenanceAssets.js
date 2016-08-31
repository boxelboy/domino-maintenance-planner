define(['require', 'app/models/Base', 'app/models/MaintenanceSchedules', 'app/models/PlannedMaintenance'], function (require, Base) {
    'use strict';

    return Base.extend({
        urlRoot: '/api/BusinessMan/assets',

        relations: function () {
            return [
                {
                    key: 'assets:maintenance_schedule',
                    relatedModel: require('app/models/MaintenanceSchedules'),
                    collection: true
                },
                {
                    key: 'assets:planned_maintenance',
                    relatedModel: require('app/models/PlannedMaintenance'),
                    collection: true
                }
            ];
        }
    });
});