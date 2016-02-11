define(['app/collections/Base', 'app/models/MaintenanceContracts'], function (Base, MaintenanceContracts) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/maintenance_contracts',
        rel: 'api:maintenance_contracts',
        model: MaintenanceContracts
    });
});