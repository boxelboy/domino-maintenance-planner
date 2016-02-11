define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ViewMenuItemView;

    ViewMenuItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'view_menu_item',
        template: require('doT!template/scheduler/menu/view_item'),

        events: {
            'click'		: 'changeView',
        },

        initialize: function (options) {
            this.label = options.label;
            this.view = options.view;
            this.menu = options.menu;
            this.disabled = this.view == 'unit';
            this.active = false;

            this.render();

            this.listenTo(this.menu.app, 'scheduler:view:change', this.onViewChange);
            this.listenTo(this.menu.app, 'scheduler:filter:change', this.onFilterChange);
        },

        onViewChange: function (view) {
      
            this.active = view == this.view;
            this.render();
        },

        onFilterChange: function (filter, resources) {
            this.disabled = this.view == 'unit' && !resources.size();
            this.render();
        },

        subViewOut : function ()
        {
        	this.$el.find('.customFilters').remove();
        },

        render: function () {
            this.$el.html(this.template({ label: this.label, view: this.menu, disabled: this.disabled, active: this.active }));
        },

        changeView: function () {
            if (!this.active && !this.disabled) {
                this.menu.app.trigger('menu:view:change', this.view);
            }

            if(this.view == "timeline")
        	{
            	//$('.menu').append('<div class="filterTimeLine"> <div data-timeline="1" class="btn btn-warning"> 1 Day</div>  <div data-timeline="7"  class="btn btn-warning"> 7 Days</div> </div>');
            	var self = this;
            	$('.filterTimeLine .btn').click(function (button){
            		self.menu.app.trigger('scheduler:filter:timeLineClick', $(this).data('timeline'));
            	});
        	}else{
        		$('.filterTimeLine').remove();
        	}

        }
    });

    return Backbone.View.extend({
        tagName: 'ul',
        className: 'view_menu',

        initialize: function (options) {
            this.app = options.app;
            this.render();
            this.addItem('Default', 'timeline');
            this.addItem('Day', 'day');
            this.addItem('Week', 'week');
            this.addItem('Month', 'month');
            //this.addItem('Year', 'year');
            //this.addItem('Resource', 'unit');
        },

        addItem: function (label, view) {
            this.$el.append(new ViewMenuItemView({ menu: this, label: label, view: view }).$el);
        }
    });
});
