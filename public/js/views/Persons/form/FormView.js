define([
    'Backbone',
    'jQuery',
    'Underscore',
    'text!templates/Persons/form/FormTemplate.html',
    'text!templates/Opportunities/aboutTemplate.html',
    'views/Editor/NoteView',
    'views/Editor/AttachView',
    'views/Companies/formPropertyView',
   /* 'views/Opportunities/formProperty/formPropertyView',*/
    'common',
    'constants',
    'dataService',
    'views/selectView/selectView'
], function (Backbone,
             $,
             _,
             personFormTemplate,
             aboutTemplate,
             EditorView,
             AttachView,
             CompanyFormProperty,
           /*  OpportunityFormProperty,*/
             common,
             CONSTANTS,
             dataService,
             SelectView) {
    'use strict';

    var personTasksView = Backbone.View.extend({
        el: '#content-holder',

        initialize: function (options) {
            var self = this;
            var formModel;
            var $thisEl = this.$el;

            App.currentPerson = options.model.get('id');

            this.io = App.socket;
            this.mId = CONSTANTS.MID[this.contentType];
            this.formModel = options.model;
            //this.formModel.on('change', this.render, this);
            this.formModel.urlRoot = '/Persons';
        },

        events: {
            click                                              : 'hideNewSelect',
            'click #tabList a'                                 : 'switchTab',
            'keyup .editable'                                  : 'setChangeValueToModel',
            'click #cancelBtn'                                 : 'cancelChanges',
            'click #saveBtn'                                   : 'saveChanges',
            'click .current-selected:not(.jobs)'               : 'showNewSelect',
            'click .newSelectList li:not(.miniStylePagination)': 'chooseOption'
        },

        hideNewSelect: function () {
            this.$el.find('.newSelectList').hide();

            if (this.selectView) {
                this.selectView.remove();
            }
        },

        setChangeValueToModel: function (e) {
            var $target = $(e.target);
            var property = $target.attr('data-id').replace('_', '.');
            var value = $target.val();

            this.modelChanged[property] = value;
            this.showButtons();
        },

        showButtons: function () {
            this.$el.find('#formBtnBlock').addClass('showButtons');
        },

        hideButtons: function () {
            this.$el.find('#formBtnBlock').removeClass('showButtons');
        },

        saveChanges: function (e) {
            e.preventDefault();
            this.savePerson(this.modelChanged);
        },

        cancelChanges: function (e) {
            e.preventDefault();
            this.modelChanged = {};
            this.renderAbout();
        },

        showNewSelect: function (e) {
            var $target = $(e.target);

            e.stopPropagation();

            if ($target.attr('id') === 'selectInput') {
                return false;
            }

            if (this.selectView) {
                this.selectView.remove();
            }

            this.selectView = new SelectView({
                e          : e,
                responseObj: this.responseObj
            });

            $target.append(this.selectView.render().el);

            return false;
        },

        chooseOption: function (e) {
            var $target = $(e.target);
            var holder = $target.parents('.inputBox').find('.current-selected');
            var type = $target.closest('a').attr('data-id');
            var text = $target.text();
            var id = $target.attr('id');

            holder.text($target.text());

            this.modelChanged[type] = id;
            this.$el.find('#assignedToDd').text(text).attr('data-id', id);
            this.showButtons();
        },

        savePerson: function (changedAttrs, type) {
            var self = this;

            this.formModel.save(changedAttrs, {
                patch  : true,
                success: function () {
                    if (type === 'formProperty') {
                        Backbone.history.fragment = '';
                        Backbone.history.navigate(window.location.hash, {trigger: true});
                    } else if (type === 'tags') {
                        self.renderTags();
                    } else {
                        self.editorView.renderTimeline();
                        self.modelChanged = {};
                        self.hideButtons();
                    }
                },
                error  : function (model, response) {
                    if (response) {
                        App.render({
                            type   : 'error',
                            message: response.error
                        });
                    }
                }
            });
        },

        deleteItems: function () {
            var mid = 39;

            this.formModel.destroy({
                headers: {
                    mid: mid
                },
                success: function () {
                    Backbone.history.navigate('#easyErp/Opportunities/kanban', {trigger: true});
                }
            });

        },

        renderAbout : function (){
            var self = this;
            var $thisEl = this.$el;
            $thisEl.find('.aboutHolder').html(_.template(aboutTemplate, this.formModel.toJSON()));
            this.renderTags();
            $thisEl.find('#nextAction').datepicker({
                dateFormat : 'd M, yy',
                changeMonth: true,
                changeYear : true,
                onSelect   : function (dateText) {
                    self.modelChanged['nextAction.date'] = new Date(dateText);
                    self.showButtons();
                }

            });
        },

        render: function () {
            var formModel = this.formModel.toJSON();
            var self = this;
            var $thisEl = this.$el;

            $thisEl.html(_.template(personFormTemplate, formModel));

            this.formProperty = new CompanyFormProperty({
                parentModel: this.formModel,
                attribute  : 'company',
                saveDeal   : self.savePerson
            });

            $thisEl.find('#companyHolder').html(
                this.formProperty.render().el
            );

            /*$thisEl.find('#opportuntiesHolder').html(
                new OpportunityFormProperty({
                    parentModel: this.formModel,
                    data       : formModel.customer,
                    attribute  : 'contact',
                    saveModel  : self.savePerson
                }).render().el
            );*/

            this.editorView = new EditorView({
                model      : this.formModel,
                contentType: 'persons'
            });

            $thisEl.find('.notes').append(
                this.editorView.render().el
            );

            $thisEl.find('.attachments').append(
                new AttachView({
                    model      : this.formModel,
                    contentType: 'opportunities'
                }).render().el
            );

            return this;
        }



    });

    return personTasksView;
});
