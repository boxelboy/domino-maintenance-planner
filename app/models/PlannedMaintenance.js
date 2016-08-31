define(['require', 'app/models/Base'], function (require, Base) {
    'use strict';

    return Base.extend({
        urlRoot: '/api/BusinessMan/planned_maintenance',

        relations: function () {
            return [];
        },

        set: function (data, options) {
			if (typeof data == 'object') {
				if (data.start_date && typeof data.start_date == 'object') {
					var startDateObj = data.start_date;
					data.start_date = data.start_date.getFullYear() + '-' + (data.start_date.getMonth() + 1) + '-' + data.start_date.getDate();
					data.start_time = startDateObj.getHours() + ':' + startDateObj.getMinutes() + ':' + startDateObj.getSeconds();
				}
				if (data.end_date && typeof data.end_date == 'object') {
					var endDateObj = data.end_date;
					data.end_date = data.end_date.getFullYear() + '-' + (data.end_date.getMonth() + 1) + '-' + data.end_date.getDate();
					data.end_time = endDateObj.getHours() + ':' + endDateObj.getMinutes() + ':' + endDateObj.getSeconds();
				}
				delete data.Key_Yes;
				delete data.color ;

				delete data.text ;
				delete data.textColor;
				delete data.uAssetId;

			}
			return Base.prototype.set.call(this, data, options);
		}
    });
});