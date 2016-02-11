define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ContractsCollection = require('app/collections/MaintenanceContracts'),
        Asset = require('app/models/MaintenanceAssets'),
        AssetCollection = require('app/collections/MaintenanceAssets'),
        chosen = require('chosen'),
        AssetView;

    AssetView = Backbone.View.extend({
        tagName: 'optgroup',

        initialize: function (options) {
            this.collection = options.collection;

            this.render();
        },

        render: function () {
            this.$el.empty();

            this.collection.each(function (contract) {
                this.$el.append('<option data-client="' + contract.get('client_company') + '" value="contract-' + contract.id + '">' + contract.get('client_company') + ' : ' + contract.get('site_title') + ' : ' + contract.get('contract_no') + '</option>');
            }, this);
        }
    });

    return Backbone.View.extend({
        template: require('doT!template/scheduler/filter/menu'),

        events: {
            'change': 'changeFilter'
        },

        initialize: function (options) {
            this.app = options.app;
            this.contracts = new ContractsCollection();
            this.render();

            this.$('select').append('<option disabled="disabled" selected="selected">Select Contract</option>');

            this.$('select').append(new AssetView({ collection: this.app.contracts }).$el);
            this.$("select").chosen({ width: '300px' });
        },

        render: function () {
            this.$el.html(this.template());
        },

        getFilter: function () {
            var selected = this.$('select').val(), split, filter;

            filter = {
                contract: []
            };

            if (selected == 'unassigned') {
                return filter;
            }

            split = selected.split('-');


            if (split[0] == 'contract') {
                filter.contract.push(split[1]);
            }

            return filter;
        },

        changeFilter: function () {
            var app = this.app;
            var filter = this.getFilter(), promises = [];
            this.contracts.reset([]);
             
            var assets = new AssetCollection();
            assets.fetch({
                data : {
                    fields: '*,assets.*,assets.planned_maintenance.*,planned_maintenance.*',
                    contract_no : filter['contract'][0]
                },
                success : _.bind(function(){
                    app.filter = filter;
                    app.trigger('menu:filter:change', filter, assets);
                })
            });
            
        },

       
    });
});
