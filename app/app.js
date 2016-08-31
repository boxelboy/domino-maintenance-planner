require.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        template: '../template',
        doTCompiler: '../lib/dot',
        doT: '../lib/require-dot',
        underscore: 'underscore',
        async: '../lib/require-async',
        moment: '../lib/moment',
        jQueryUI: '../lib/jquery-ui',
        chosen: '../lib/chosen.min'
    },
    shim: {
        'backbone': {
    		deps: ['underscore', 'jquery'],
    		exports: 'Backbone'
	    },
        'jQueryUI': {
            export: '$',
            deps: ['jquery']
        },
        'chosen' : {
            deps: ["jquery"]
        },
	    'underscore': {
	        exports: '_'
	    },
        'lz-string': {
            exports: 'LZString'
        },
        'dhtmlxscheduler': {
            deps: ['jquery'],
            exports: 'scheduler'
        },
        'dhtmlxscheduler_active_links': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_map_view': {
            deps: ['dhtmlxscheduler', 'async!http://maps.google.com/maps/api/js?sensor=false']
        },
        'dhtmlxscheduler_minical': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_multisection': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_outerdrag': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_serialize': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_timeline': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_tooltip': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_units': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_year_view': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_mvc': {
            deps: ['dhtmlxscheduler']
        }
    }
});

require(
    [
        'jquery', 'underscore', 'backbone', 'sync', 'app/router', 'app/views/App/AppView', 'jQueryUI'
    ],
    function ($, _, Backbone, Sync, Router, AppView) {
        var app = new AppView();
        app.setRouter(new Router({ app: app }));

        $('body').append(app.$el);

        app.on('ready', function () {
            Backbone.history.start();
        });
    }
);
