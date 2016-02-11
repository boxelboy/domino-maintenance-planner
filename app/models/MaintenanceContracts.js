define(['require', 'app/models/Base', 'app/models/MaintenanceAssets', 'app/models/MaintenancePlanningAssets'], function (require, Base) {
    'use strict';

    return Base.extend({
        urlRoot: 'http://localhost:32767/api/BusinessMan/maintenance_contracts',

        relations: function () {
            return [
                {
                    key: 'maintenance_contracts:assets',
                    relatedModel: require('app/models/MaintenanceAssets'),
                    collection: true
                },
                {
                    key: 'maintenance_contracts:maintenance_planning_assets',
                    relatedModel: require('app/models/MaintenancePlanningAssets'),
                    collection: false
                }
            ];
        }
    });
});