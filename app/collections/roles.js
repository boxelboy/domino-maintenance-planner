define(['app/collections/Base', 'app/models/roles'], function (Base, Role) {
    'use strict';

    return Base.extend({
        url: 'http://localhost:32767/api/BusinessMan/roles',
        rel: 'api:roles',
        model: Role
    });
});