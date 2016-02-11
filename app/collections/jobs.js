define(['app/collections/Base', 'app/models/jobs'], function (Base, Jobs) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/jobs',
        rel: 'api:jobs',
        model: Jobs
    });
});