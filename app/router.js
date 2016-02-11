define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        self;

    return Backbone.Router.extend({
        initialize: function (options){
            self = this;
            this.app = options.app;
        },

        routes: {
            '': 'scheduler'
        },

        scheduler: function () {
            require(['app/views/Schedule/LayoutView'], function (SchedulerView) {
                var scheduler = new SchedulerView({ app: self.app });
                self.app.setView(scheduler);
                scheduler.start();
            });
        }
    });
});
