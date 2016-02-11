define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ViewMenuView = require('app/views/Schedule/Menu/ViewMenuView'),
        DateMenuView = require('app/views/Schedule/Menu/DateMenuView'),
        FilterMenuView = require('app/views/Schedule/Menu/FilterMenuView'),
        CommitMenuView = require('app/views/Schedule/Menu/CommitMenuView');

    return Backbone.View.extend({
        className: 'menu',

        initialize: function (options) {
            this.app = options.app;

            this.viewMenu = new ViewMenuView({ app: this.app });
            this.dateMenu = new DateMenuView({ app: this.app });
            this.commitMenu = new CommitMenuView({ app : this.app });
            this.filterMenu = new FilterMenuView({ app : this.app });

            this.render();

            this.$el.append(this.viewMenu.$el);
            this.$el.append(this.dateMenu.$el);
            this.$el.append(this.commitMenu.$el);
            this.$el.append(this.filterMenu.$el);
        }
    });
});



