define(['app/collections/Base', 'app/models/JobAssets'], function (Base, JobAssets) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/job_assets',
        rel: 'api:job_assets',
        model: JobAssets
    });
});