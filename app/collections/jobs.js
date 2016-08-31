define(['app/collections/Base', 'app/models/jobs'], function (Base, Jobs) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/jobs',
        rel: 'api:jobs',
        model: Jobs
    });
});