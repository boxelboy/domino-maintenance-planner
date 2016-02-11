define(['require', 'app/models/Base'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: 'http://localhost:32767/api/BusinessMan/jobs',

        relations: function ()
		{
		}
    });
});