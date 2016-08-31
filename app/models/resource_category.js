define(['require', 'app/models/Base'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/resource_categories',

        relations: function ()
		{
		}
    });
});