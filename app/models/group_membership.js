define(['require', 'app/models/Base', 'app/models/group'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: 'http://localhost:32767/api/BusinessMan/group_memberships',

        relations: function ()
		{
			return [
			{
				key: 'group_memberships:group',
				relatedModel: require('app/models/group'),
				collection: false
			}];
		}
    });
});