define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        HeaderView = require('app/views/App/HeaderView'),
        LoaderView = require('app/views/App/LoaderView'),
        //CategoryCollection = require('app/collections/resource_categories'),
        //GroupCollection = require('app/collections/groups'),
        ContractCollection = require('app/collections/MaintenanceContracts');
        
    return Backbone.View.extend({
        el: 'body',
        template: require('doT!template/app/app'),

   		initialize: function () {

            this.contracts = new ContractCollection();

            this.render();

            this.loader = new LoaderView({ app: this });
            this.header = new HeaderView({ app: this, el: this.$('#app_header') });

            this.$el.append(this.loader.$el);

            this.listenTo(this.loader, 'ready', this.ready);

            this.loader.load();
        },

        ready: function () {
            this.loader.remove();
            this.trigger('ready');
        },


        setRouter: function (router) {
            this.router = router;
        },

        setView: function (view, url) {
            this.$('#app_content').empty().append(view.$el);
            if (url && this.router) {
                this.router.navigate(url);
            }
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});
