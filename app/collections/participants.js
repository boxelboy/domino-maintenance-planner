define(['app/collections/Base', 'app/models/participant'], function (Base, Participant) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/participants',
        rel: 'api:participants',
        model: Participant
    });
});
