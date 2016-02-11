/*---------------------------------------------------------------------------------------------------------------
*																												*
*	The maintenance planner uses 6 tables																		*                        
*																												*
*	+===============================+=======================+========================+							*
*	|       Table Name              |  API Entity Name      |  BusinessMan File      |							*
*	+===============================+=======================+========================+							*
*	| SCHEDULE                      | participants          | BMData8                |							*
*	+-------------------------------+-----------------------+------------------------+							*
*	| SCHEDULE_DETAILS              | schedules             | BMData8                |							*
*	+-------------------------------+-----------------------+------------------------+							*
*	| Maintenance_Schedules         | maintenance_schedules | Maintenance_Planning   |							*
*	+-------------------------------+-----------------------+------------------------+							*
*	| Planned_Maintenance           | planned_maintenance   | Maintenance_Planning   |							*
*	+-------------------------------+-----------------------+------------------------+							*
*	| Assets                        | assets                | BMData10               |							*
*	+-------------------------------+-----------------------+------------------------+							*
*	| Jobs                          | jobs                  | BMData10               |							*
*	+-------------------------------+-----------------------+------------------------+							*
*																												*
*	The display is constructed by reading the entries in assets to make a list of clients and contracts.		*
*	Until a contract has been selected, the display is empty.													*
*																												*
*	On selecting a contract, the assets for that contract are pulled fron the assets entity and displayed down  *
*	the left. Planned maintenance (both historic and planned for the future) are read from the					*
*	planned_maintenace entity and displayed. Unplanned maintenance - scheduled - is displayed by using the      *
*	date of the last planned maintenance then the frequency, period, preferred day of the month and preferred   *
*	day of the week from maintenance_schedules to display scheduled maintenance. Each scheduled maintenance		*
*	has an additional field called 'new' and this is set to 'Yes'. The field is not needed by the Scheduler		*
*	or any entity and is only used to differentiate scheduled from planned maintenance in the display.			*
*																												*
*	PLEASE NOTE: scheduled maintenance 'events' do not exist ie they are not in a table or entity. They are		*
*	only for display and planning purposes.																		*
*																												*
*	There is colour coding to disntinguish each of the maintenance states:                                      *
*																												*
*	Green - completed																							*
*	Dark blue - planned																							*
*	Red - overdue																								*
*	Yellow - on hold/escalated																					*
*	Light blue - scheduled																						*
*																												*
*	To plan scheduled maintenance (commit), the user selects a start and end date from the commit popup and		*
*	clicks 'save'. This script loops thru each of the assets comparing their dates with the user selected		*
*	dates. If the field 'new' is set to 'Yes', the field is removed and the 'event' saved to					*
*	planned_maintenance. It is also added to an array called this.assetList. Once all the scheduled				*
*	maintenance has been planned, this.assetList is sorted into date order and looped thru to find each of		*
*	assets for a particular date. A job is created for the assets, an entry in the Scheduler is made and		*
*	the participants table is updated so that the default engineer is allocated. It is at this point that		*
*	the scheduled maintenance has been fullied planned with a date & time and an allocated engineer.			*
*																												*
*	The reason for the array this.assetList is to ensure that only one job is created for the assets due for	*
*	maintenance on the same day.																				*
*																												*
*	Some quirks																									*
*	===========																									*
*	Currently there is a need for jobs to be updated via BusinessMan. Outside of the api method the way to		*
*	link jobs, schedules and participants is via the field 'group_id'. That is why jobs is updated after		*
*	schedules and participants records have been created.														*
*																												*
*	Due to an issue with date calculation in Safari and Firefox, the timestamp is converted to UTC.				*
---------------------------------------------------------------------------------------------------------------*/


 define(function (require) {
 	'use strict';
 	var Backbone = require('backbone'),
 		PlannedMaintenanceCollect = require('app/collections/PlannedMaintenance'),
 		PlannedMaintenanceModel = require('app/models/PlannedMaintenance'),
 		AssetCollection = require('app/collections/MaintenanceAssets'),
 		Asset = require('app/models/MaintenanceAssets'),
 		MaintSchedCollecton = require('app/collections/MaintenanceSchedules'),
 		SchedCollection = require('app/collections/schedules'),
 		SchedModel = require('app/models/schedules'),
 		ResourceModel = require('app/models/resource'),
 		ResourceCollection = require('app/collections/resources'),
 		ParticipantModel = require('app/models/participant'),
 		ContractsCollection = require('app/collections/MaintenanceContracts'),
 		JobModel = require('app/models/jobs'),
 		JobCollection = require('app/collections/jobs'),
 		JobAssetsModel = require('app/models/JobAssets'),
 		JobAssetsCollection = require('app/collections/JobAssets'),
 		scheduler = require('scheduler'),
 		moment = require('moment'),
 		LoaderView,
 		PopUpView;

 	PopUpView = Backbone.View.extend({
 		tagName: 'div',
 		id: 'form',
 		template: require('text!template/scheduler/popup/form.html'),
 		events: {
 			'click a.saveModal': 'saveModal',
 			'click a.closeModal': 'closeModal',
 		},

 		initialize: function (options) {
 			this.app = options.app;
 			this.event = event.event;
 			this.schedule = event.schedules.get(this.event.id);
 			this.render();
 		},

 		render: function () {
 			var data = {
 				data: this.event,
 				contract: this.app.filter,
 			};
 			var compiledTemplate = _.template(this.template);
 			this.$el.html(compiledTemplate(data));
 		},

 		saveModal: function (event) {
 			event.preventDefault();
 			this.schedule.set('start_date', this.$("form input[name=start_date]").val().toString());
 			this.schedule.set('start_time', this.$("form input[name=start_time]").val().toString());
 			this.schedule.set('end_date', this.$("form input[name=end_date]").val().toString());
 			this.schedule.set('end_time', this.$("form input[name=end_time]").val().toString());
 			this.schedule.set('description', this.$('form textarea[name=description]').val());
 			this.schedule.save(null, {
 				success: _.bind(function (model, response) {
 					this.remove();
 				}, this),
 				error: _.bind(function (error) {
 					//console.log(error, 'Looks like something went wrong!');
 				}, this),
 			});
 		},

 		closeModal: function (event) {
 			event.preventDefault();
 			this.remove();
 		},
 	});

 	LoaderView = Backbone.View.extend({
 		className: 'loader',
 		template: require('doT!template/scheduler/loader'),
 		initialize: function () {
 			this.render();
 		},

 		render: function () {
 			this.$el.html(this.template());
 		},

 		show: function () {
 			this.$el.css('display', 'flex');
 		},

 		hide: function () {
 			this.$el.css('display', 'none');
 		}
 	});

 	return Backbone.View.extend({
 		className: 'scheduler dhx_cal_container',
 		template: require('doT!template/scheduler/scheduler'),

 		initialize: function (options) {
 			this.app = options.app;
 			this.loader = new LoaderView();
 			this.plannedMaintenance = new PlannedMaintenanceCollect();
 			this.assets = new AssetCollection();
 			this.maintsched = new MaintSchedCollecton();
 			this.scheduler = new SchedCollection();
 			this.schedmodel = new SchedModel();
 			this.filter = {};
 			this.client = "";
 			this.started = false;
 			this.LastDate = {};
 			this.assetList = [];
 			this.scheduledEvents = [];
 			this.render();
 			this.listenTo(this.app, 'menu:filter:change', this.onFilterChange)
 			this.listenTo(this.app, 'menu:view:change', this.setView);
 			this.listenTo(this.app, 'menu:date:previous', this.previousDate);
 			this.listenTo(this.app, 'menu:date:next', this.nextDate);
 			this.listenTo(this.app, 'scheduler:filter:timeLineClick', this.reloadTimeLine);
 			this.listenTo(this.app, 'menu:click:commit', this.onCommitClick);
 			//Default Timeline Settings
 			this.timelineSettings = {};
 			this.timelineSettings.unit = "week";
 			this.timelineSettings.date = "%W";
 			this.timelineSettings.step = 1;
 			this.timelineSettings.size = 52;
 			this.timelineSettings.start = 0;
 			this.timelineSettings.length = 1;
 			this.timelineSettings.secondUnit = 'day';
 			this.timelineSettings.secondDate = '%d %M';
 			this.createTimelineView();
 		},

 		render: function () {
 			this.$el.html(this.template());
 			this.$el.append(this.loader.$el);
 		},

 		createTimelineView: function (contract) {
 			var assetsArr = [];
 			assetsArr.push({
 				key: '',
 				label: ''
 			});
 			scheduler.createTimelineView({
 				name: 'timeline',
 				x_unit: this.timelineSettings.unit,
 				x_date: this.timelineSettings.date,
 				x_step: this.timelineSettings.step,
 				x_size: this.timelineSettings.size,
 				x_start: this.timelineSettings.start,
 				x_length: this.timelineSettings.length,
 				y_unit: assetsArr,
 				y_property: 'id',
 				render: 'bar'
 			});
 		},

 		onCommitClick: function (StartDate, EndDate) {
 			var contracts = new ContractsCollection();
 			contracts.fetch({
 				data: {
 					fields: '*',
 					id: this.filter.contract[0]
 				},
 				success: _.bind(function () {

 					_.each(this.plannedMaintenance.models, _.bind(function (model) {
 						if (model.get('new') == "Yes") {
 							if (new Date(model.get('start_date')) > new Date(StartDate.split("-").reverse().join("-") + 'T00:00') && new Date(model.get('end_date')) < new Date(EndDate.split("-").reverse().join("-") + 'T23:59')) {
 								model.unset('new');
 								model.unset('frequency_period');
								this.assetList.push(model);		// pushing 'scheduled' into array
 								model.save();
 							}
 						}

 					}, this)); // end of plannedmaintenance each
 				this.assetList.sort(function(a,b){return new Date(a.attributes.start_date).getTime() - new Date(b.attributes.start_date).getTime()});
 				var oldDate = this.assetList[0].get('start_date');
 				var holdArr = [];
 				var len = this.assetList.length;
 				_.each(this.assetList, function (asset) {
 					len -= 1;
					if (oldDate != asset.get('start_date') || len == 0) {
 						if (len == 0) {holdArr.push(asset);}
 						var jobDetails = "Assets: ";
 						_.each(holdArr, function (item) {
 							jobDetails += item.get('asset_recordid') + ' ';
 						});
 						var sd = holdArr[0].get('planned_start_timestamp');
 						var ed = holdArr[0].get('planned_end_timestamp');
 						var resourceID = holdArr[0].get('default_resourceid');
 						var eventName = holdArr[0].get('maint_event_type');
 						var roleID = holdArr[0].get('maint_eventid');

  						var job = new JobModel({
 							hrs_start: Number(sd.slice(11, 13)),
 							mins_start: Number(sd.slice(14, 16)),
 							hrs_finish: Number(ed.slice(11, 13)),
 							mins_finish: Number(ed.slice(14, 16)),
 							description: eventName + 'for Client: ' + contracts.models[0].get('client_company'),
 							job_detail: jobDetails,
 							notes: 'added via maintenance planner'
 						}); // end of job
 						job.save(null, {
 							success: function (jobResponse) {
 								var schedmodel = new SchedModel({
 									all_day: 'No',
 									description: eventName + 'for Client: ' + contracts.models[0].get('client_company'),
 									end_date: ed.slice(0, 10),
 									end_time: ed.slice(11, 16),
 									scheduled: 1,
 									start_time: sd.slice(11, 16),
 									start_date: sd.slice(0, 10),
 									job_number: jobResponse.id
 								}); // end of schedmodel
 								/* adding asset and job num to Job_Assets */
 								_.each(holdArr, function (item) {
 									var jobAsset = new JobAssetsModel({
 										asset_id: item.get('asset_recordid'),
 										job_id: jobResponse.id
 									});
 									jobAsset.save();
 								});

 								schedmodel.save(null, {
 									success: function (mdl, response) {
 										var participant = new ParticipantModel({
 											event_name: eventName,
 											resource_id: resourceID,
 											schedule_id: response.id,
 											role_id: roleID,
 											group_id: response.group_id
 										}); // end of participant
 										participant.save(null, {
 											success: function (newResponse) {
 												job.set({ group_id: response.group_id });
 												job.save();
 											} // end of participant save success
 										}); // end of participant save
 									} // end of schedmodel save success
 								}); // end of schedmodel save
 							} // end of job save success
 						}); // end of job save

	 						holdArr = [];
		 					holdArr.push(asset);
							oldDate = asset.get('start_date');
 					} else {
	 					holdArr.push(asset);
						oldDate = asset.get('start_date');
 					}

 				}); //end of each loop

 				}, this) // end of contracts success

 			}); // end of contracts fetch
 		},

 		onFilterChange: function (filter, assets) {
 			this.filter = filter;
 			this.assets = assets;
 			this.plannedMaintenance.reset();
 			scheduler.clearAll();
 			this.loadEvents(true);
 			this.createAssetViews();
 		},

 		onViewChange: function (view, date) {
 			this.loadEvents(false);
 			this.app.trigger('scheduler:view:change', view, date);
 		},

 		createAssetViews: function () {
 			var assetArray = [];
 			this.assets.each(function (asset) {
 				//console.log(asset);
 				assetArray.push({
 					key: asset.get('id'),
 					label: '<i class="fa fa-angle-right"></i> ' + asset.get('maintenance_of')
 				});
 			});
 			scheduler.createTimelineView({
 				name: 'timeline',
 				x_unit: this.timelineSettings.unit,
 				x_date: this.timelineSettings.date,
 				x_step: this.timelineSettings.step,
 				x_size: this.timelineSettings.size,
 				x_start: this.timelineSettings.start,
 				x_length: this.timelineSettings.length,
 				y_unit: assetArray,
 				y_property: 'uAssetId',
 				render: 'bar',
 				event_dy : 'full',
 				round_position : true
 			});
 		},

 		setView: function (view) {
 			scheduler.setCurrentView(scheduler._date, view);
 		},

 		getView: function () {
 			return scheduler._mode;
 		},

 		previousDate: function () {
 			scheduler._click.dhx_cal_next_button(0, -1);
 		},

 		nextDate: function () {
 			scheduler._click.dhx_cal_next_button(0, 1);
 		},

 		start: function () {
 			scheduler.skin = 'flat';
 			scheduler.config.xml_date = '%Y-%m-%d %H:%i';
 			scheduler.config.show_loading = false;
 			scheduler.config.multi_day = true;
 			scheduler.config.mark_now = true;
 			scheduler.config.default_date = '%d %F %Y';
 			scheduler.config.hour_date = '%g:%i %A';
 			scheduler.config.dblclick_create = false;
 			scheduler.config.drag_create = true;
 			scheduler.config.edit_on_create = true;
 			scheduler.config.icons_select = ['icon_details', 'icon_delete'];
 			scheduler.config.full_day = true;
 			scheduler.config.multisection = true;
 			scheduler.config.multisection_shift_all = false;
 			scheduler.config.resize_month_events = true;
 			scheduler.config.resize_month_timed = true;
 			scheduler.config.first_hour = 0;
 			scheduler.config.last_hour = 24;
 			scheduler.config.scroll_hour = 0;
 			scheduler.config.map_inital_zoom = 8;
 			scheduler.config.map_resolve_user_location = false;
 			scheduler.config.drag_resize = false;
 			scheduler.xy.scale_height = 30;

 			//scheduler.config.readonly = true;
 			scheduler._init_event = _.bind(function (event) {
 				var plannedItem = this.plannedMaintenance.get(event.id);
 				event.start_date = scheduler._init_date(plannedItem.get('start_date') + ' ' + plannedItem.get('start_time'));
 				event.end_date = scheduler._init_date(plannedItem.get('end_date') + ' ' + plannedItem.get('end_time'));
 				var frequency;
 				if (plannedItem.get('frequency') !== undefined) {
 					frequency = plannedItem.get('frequency')
 						.substr(0, 1);
 				}
 				event.text = plannedItem.get('frequency_period') + frequency;
 				event.uAssetId = plannedItem.get('asset_recordid');

 				if (plannedItem.get('completed') === "Yes") {
 					// setting completed jobs to green
 					event.color = '#00ff00';
 					event.textColor = '#ffffff';
 				} else if (new Date(event.start_date) < new Date() && plannedItem.get('completed') !== "Yes") {
 					// setting overdue jobs to red
 					event.color = '#ff0000';
 					event.textColor = '#ffffff';
 				} else if (plannedItem.get('completed') === "Hold") {
 					// setting on hold or escaltated jobs to yellow
 					event.color = '#ffff00';
 					event.textColor = '#000000'; 					
 				} else if (plannedItem.get('new') === "Yes") {
 					// setting scheduled to light blue
 					event.color = '#95b9c7';
 					event.textColor = '#ffffff';
 				} else {
 					// default planned to blue
 					event.color = '#0000ff';
 					event.textColor = '#ffffff';
 				}
 				if (event.start_date === null) {
 					this.plannedMaintenance.remove(event.id);
 				}
 			}, this);
 			scheduler.attachEvent('onViewChange', _.bind(this.onViewChange, this));
 			scheduler.showLightbox = _.bind(function (id) {
 				var event = scheduler.getEvent(id);
 				this.popupForm = new PopUpView({
 					'event': event,
 					'schedules': this.plannedMaintenance
 				});
 				this.$el.append(this.popupForm.$el);
 				scheduler.startLightbox(id, $('#form')[0]);
 			}, this);
 			this.$el.dhx_scheduler({
 				mode: 'timeline'
 			});
 			scheduler.backbone(this.plannedMaintenance);
 			this.started = true;

 			scheduler.attachEvent("onBeforeDrag", function (id, mode, e) {

 				var event = scheduler.getEvent(id);

 				if (mode == "create") {
 					return false;
 				}

 				if (typeof event.new === 'undefined') {
 					return false;
 				} else {
 					return true;
 				}
 			});

 			this.plannedMaintenance.on('scheduler:change scheduler:add', _.bind(function (schedule, test) {

 			}, this));
 		},

 		loadEvents: function (filterChanged) {
 			var formatDate = scheduler.date.date_to_str('%Y-%m-%d');
 			if (!this.startDate || !this.endDate || scheduler._min_date < this.startDate || scheduler._max_date > this.endDate || filterChanged) {
 				this.startDate = scheduler._min_date;
 				this.endDate = scheduler._max_date;
 				var assetIds = [];
 				if (this.assets) {
 					this.assets.each(function (asset) {
 						assetIds.push(asset.id);
 					});
 				}
 				if (_.isEmpty(assetIds)) {
 					assetIds = "!";
 				} else {
 					assetIds = assetIds.join(',');
 				}
 				this.startDateFormat = formatDate(this.startDate);
 				this.endDateFormat = formatDate(this.endDate);
 				this.plannedMaintenance.fetch({
 					remove: false,
 					data: {
 						asset_recordid: assetIds,
 						fields: '*, planned_maintenance.*',
 						planned_start_date: '>' + this.startDateFormat,
 						planned_end_date: '<' + this.endDateFormat,
 						sort: 'planned_start_date'
 					},
 					success: _.bind(function (model) {
 						if (assetIds != "!") {
 							this.maintsched.fetch({
 								data: {
 									asset_recordid: assetIds,
 									fields: '*',
 									sort: 'planned_end_date'
 								},
 								success: _.bind(function (scheduleItems) {
 									var days = {
 										'Day': 1,
 										'Week': 7,
 										'Month': 30,
 										'Year': 365
 									};
 									_.each(scheduleItems.models, _.bind(function (scheduleItem) {
 										var found = false;
 										var assetID, lastDate;
 										_.each(this.plannedMaintenance.last(this.plannedMaintenance.length).reverse(),
 											function (model) {
 												if (!found) {
 													if (model.get('asset_recordid') == scheduleItem.get('asset_recordid')) {
 														lastDate = model.get('end_date');
 														assetID = model.get('asset_recordid');
 														found = true;
 													}
 												}
										});

 										if (!found) {
 											lastDate = this.LastDate[scheduleItem.get('asset_recordid')] = moment(new Date()).format('YYYY-MM-DD');
 											assetID = scheduleItem.get('asset_recordid');
 										} else if (this.LastDate[assetID] === undefined) {
 											this.LastDate[assetID] = lastDate;
 										}
 										var now, sd, ed;
 										now = sd = ed = lastDate;
 										while ((new Date(sd) < new Date(scheduler._max_date)) && (new Date(sd) >= new Date(this.LastDate[assetID]))) {
 											now = new Date(sd);
 											now.setDate(now.getDate() + days[scheduleItem.get('frequency')] * scheduleItem.get('period'));
 											now.setHours(scheduleItem.get('preferred_time_hrs'));
 											now.setMinutes(scheduleItem.get('preferred_time_mins'));
 											var holdSD = new Date(now);		// hack to fix date problem in safari & firefox

 											sd = moment(holdSD).format('YYYY-MM-DD HH:mm');
 											sd = moment(sd).day(scheduleItem.get('preferred_day_of_week')).format('YYYY-MM-DD HH:mm');
 											var hashDate = sd.replace(/\s/g,'T');		// hack to fix date problem in safari & firefox
 											ed = moment(new Date(hashDate)).add(scheduleItem.get('duration_hours'), 'hours').add(scheduleItem.get('duration_mins'), 'minutes').format('YYYY-MM-DD HH:mm');
 											var scheduledJobs = {
 												asset_id: scheduleItem.get('asset_id'),
 												asset_level: scheduleItem.get('asset_level'),
 												contract_no: scheduleItem.get('contract_no'),
 												completed: 'No',
 												creation_by: 'Maintenance Planner',
 												default_resource_name: scheduleItem.get('default_resource_name'),
 												default_resource_category_name: scheduleItem.get('default_resource_category_name'),
 												default_resource_category_id: scheduleItem.get('default_resource_categoryid'),
 												default_resourceid: scheduleItem.get('default_resourceid'),
 												duration_hours: scheduleItem.get('duration_hours'),
 												duration_mins: scheduleItem.get('duration_mins'),
 												job_required: scheduleItem.get('is_job_required'),
 												label: scheduleItem.get('display_label'),
 												maint_event_type: scheduleItem.get('maint_event_type'),
 												maint_eventid: scheduleItem.get('maint_eventid'),
 												period: scheduleItem.get('period'),
 												preferred_date_of_month: scheduleItem.get('preferred_date_of_month'),
 												preferred_day_of_week: scheduleItem.get('preferred_day_of_week'),
 												preferred_time_hrs: scheduleItem.get('preferred_time_hrs'),
 												preferred_time_mins: scheduleItem.get('preferred_time_mins'),
 												priority: scheduleItem.get('priority'),
 												schedule_job: scheduleItem.get('schedule_job'),
 												planned_start_timestamp: sd,
 												planned_end_timestamp: ed,
 												asset_recordid: scheduleItem.get('asset_recordid'),
 												frequency: scheduleItem.get('frequency'),
 												frequency_period: (scheduleItem.get('period')),
 												new: "Yes",
 												start_date: sd.slice(0, 4) + "-" + sd.slice(5, 7) + "-" + sd.slice(8, 10),
 												start_time: scheduleItem.get('preferred_time_calc'),
 												end_date: ed.slice(0, 4) + "-" + ed.slice(5, 7) + "-" + ed.slice(8, 10),
 												end_time: ed.slice(11, 16),
 											};
 											// adding scheduled maintenace to planned to enable it to be displayed in the calendar
 											this.plannedMaintenance.add(scheduledJobs);
											sd = sd.replace(/\s/g,'T');			// hack to fix date problem in safari & firefox
 										}
 									}, this));
 								}, this)
 							});
 						}
 					}, this)
 				});
 				return;
 			}
 		}
 	});
 });
