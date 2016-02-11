define(['app/collections/Base', 'app/models/group'], function (Base, Group) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/groups',
        rel: 'api:groups',
        model: Group
    });
});