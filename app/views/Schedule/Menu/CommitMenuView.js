define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        PreviousView, NextView, CommitView, PopUpView;

    PopUpView = Backbone.View.extend({
		tagName: 'div',
		id: 'form',
		template: require('text!template/scheduler/popup/commit.html'),
		events : {
			'click a.saveModal' : 'save',
			'click a.closeModal' : 'close',
		},

		initialize: function (options)
		{
			this.app = options.app;
			this.render();
		},
		render: function ()
		{
			var data = {
				contract : this.app.filter.contract[0]
			};
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(data));
		},
		save : function (event)
		{
			event.preventDefault();
			this.app.trigger('menu:click:commit', $('#start_date').val(), $('#end_date').val());
			this.remove();

		},
		close : function (event)
		{
			event.preventDefault();
			
			this.remove();
		},
	});

    return Backbone.View.extend({

    	template: require('doT!template/scheduler/menu/commit'),

        events : {
        	'click .btn' :'action'
        },

        action : function (event)
        {
        	event.preventDefault();
        	var Popup = new PopUpView({ app: this.app });
        	this.$el.append(Popup.$el);
        },

        initialize : function (options){
        	this.app = options.app;
        	this.$el.html(this.template());
        	this.render();
        },
    });
});
