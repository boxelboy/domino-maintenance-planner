define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: 'li',
        template: require('doT!template/app/loader_item'),

        initialize: function (options) {
            this.collection = options.collection;
            this.label = options.label;
            this.data = options.data;
            this.loading = true;

            this.render();

            var promise = this.collection.fetch({ reset: true, data: this.data });

            promise.progress(_.bind(this.fetchComplete, this));
            promise.done(_.bind(this.fetchComplete, this));
        },

        fetchComplete: function () {
            this.trigger('ready');
            this.render();
        },

        render: function () {
            this.$el.html(this.template({ label: this.label, loading: this.loading, collection: this.collection }));
        }
    });

    return Backbone.View.extend({
        className: 'loader',
        template: require('doT!template/app/loader'),

        initialize: function (options) {
            this.app = options.app;
            this.loaded = 0;
            this.expected = 0;

            this.render();
        },

        load: function () {
            this.addItem('Contracts', this.app.contracts, { sort:'client_company' });
        },

        addItem: function (label, collection, data) {
            var itemView = new ItemView({ label: label, collection: collection, data: data });

            this.expected++;
            this.listenTo(itemView, 'ready', this.ready);

            this.$('ul').append(itemView.$el);
        },

        ready: function () {
            this.loaded++;

            if (this.loaded == this.expected) {
                this.trigger('ready');
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});
