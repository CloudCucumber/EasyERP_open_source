define([
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/customDashboard/list/ListHeader.html',
    'views/customDashboard/list/ListItemView',
    'views/customDashboard/CreateView',
    'collections/customDashboard/filterCollection',
    'models/CustomDashboardModel',
    'constants'
], function ($, _, listViewBase, listTemplate, ListItemView, CreateView, contentCollection, Model, CONSTANTS) {
    'use strict';

    var CustomDashboardsListView = listViewBase.extend({
        ListItemView     : ListItemView,
        listTemplate     : listTemplate,
        contentCollection: contentCollection,
        contentType      : CONSTANTS.CUSTOMDASHBOARD,
        hasPagination    : true,

        initialize: function (options) {
            this.CreateView = CreateView;
            this.startTime = options.startTime;
            this.collection = options.collection;
            this.parrentContentId = options.collection.parrentContentId;
            this.sort = options.sort;
            this.filter = options.filter;
            this.page = options.collection.currentPage;
            this.contentCollection = contentCollection;

            listViewBase.prototype.initialize.call(this, options);
        },

        render: function () {
            var $currentEl = this.$el;

            $currentEl.html('');
            $currentEl.append(_.template(listTemplate));

            return new this.ListItemView({
                collection : this.collection,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            });
        }
    });

    return CustomDashboardsListView;
});
