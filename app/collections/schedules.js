define(['app/collections/Base', 'app/models/schedules'], function (Base, Schedule) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/schedules',
        rel: 'api:schedules',
        model: Schedule
    });
});