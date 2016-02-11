define(['require', 'app/models/Base', 'app/models/participant'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: 'http://localhost:32767/api/BusinessMan/schedules',

		relations: function ()
		{
			return [
				{
					key: 'schedules:participants',
					relatedModel: require('app/models/participant'),
					collection: true
				}
			];
		},

		set: function (data, options) {
			return Base.prototype.set.call(this, data, options);
		}
	});
});