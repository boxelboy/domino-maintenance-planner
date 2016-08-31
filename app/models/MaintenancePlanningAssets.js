define(['require', 'app/models/Base'], function (require, Base) {
    'use strict';

    return Base.extend({
        urlRoot: '/api/BusinessMan/maintenance_planning_assets',

        relations: function () {
            return [];
        }
    });
});