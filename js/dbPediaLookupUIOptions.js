/**
 This file prepare the UI for  dbpedia lookup, so that user can select ontology classed

 @authors :AQM Saiful Islam
 @dependency
 {
    dbPediaLookup.js
    progressbar.js
 }
 */

var dbPediaLookupUIOptions  = {

    /**
     * Ontology look up classes
     */
    ontologyClasses : [ '--none--', 'auto', 'Place', 'Person', 'Work', 'Species', 'Organisation'],

    /**
     * Current selected tab's class name
     */
    selectedTabClass : null,

    /**
     * Show the ontology class for each column
     *
     * @param {array} columnNames
     *
     * @return void
     */
    showOntologyListOptions : function (columnNames) {

        var ontologyDisplayOptionContainer = $('#ontologyClassSelectionContainer'),
            ontologyDisplayOptionPanel = $('#ontologyClassSelectionPanel');

        ontologyDisplayOptionContainer.show();

        ontologyDisplayOptionPanel.empty();
        ontologyDisplayOptionPanel.show();

        var columnValue = '',i = 0;
        for (i = 0; i < columnNames.length; i++) {
            columnValue += "<tr class = 'showResult'>";
            columnValue += "<td class = 'showResult'>" + columnNames[i] + "</td>";
            columnValue += "<td class = 'showResult'>" + dbPediaLookupUIOptions.getListOptions('ontologyList' + i) + "</td>";
            columnValue += "</tr>";
        }

        ontologyDisplayOptionPanel.append(
            "<table class = 'showResult' width='auto'>" + columnValue + "</table>"
        );
    },

    /**
     * Get the html for a list
     *
     * @param {string} id html id
     *
     * @returns {string} html
     */
    getListOptions : function(id) {

        var html = '<select>\n';
        $.each(dbPediaLookupUIOptions.ontologyClasses, function(index, value) {
            html += '<option id="' + id + '" value="' + value + '" >' + value + '</option>\n';
        });
        html += '</select>';
        return html;
    },

    /**
     * Build the modal view to select the class URIS
     * @param {object} selectedElements
     *
     * @return void
     */
    buildOntologySelectionModal : function (selectedElements) {

        var i = 0, j = 0, listValues = [], firstSearchKey = null, columnName = '',
            tabId = null, tabLeftContent = '', tabRightContent = '', tabContent = '',
            isActiveTab = false;

        dbPediaLookupUIOptions.resetOntologySelectionModalTabContent();

        for (i = 0; i<selectedElements[0].length; i++) {

            isActiveTab = false;
            if (i === 0) {
                isActiveTab = true ;
            }

            listValues = [];
            for (j = 1;j<selectedElements.length;j++) { // skipping the column names
                listValues.push(selectedElements[j][i]);
            }
            firstSearchKey = listValues[0];
            columnName = selectedElements[0][i];
            tabId = dbPediaLookupUIOptions.getTabId(columnName);

            // assign the 1st tab class name
            if (dbPediaLookupUIOptions.selectedTabClass === null) {
                dbPediaLookupUIOptions.selectedTabClass = tabId;
            }

            var rightClass = 'modal-right '+tabId;

            tabLeftContent = "<div class='modal-left'>" + dbPediaLookupUIOptions.getRowsAsListView(listValues) +"</div>",
            tabRightContent = "<div class='" + rightClass +"'>" + dbPediaLookupUIOptions.getTabTable(tabId, dbPediaLookup.lookUpResult[firstSearchKey])+ '</div>';
            tabContent = tabLeftContent+ tabRightContent;
            dbPediaLookupUIOptions.addTabContent(tabId, columnName, tabContent, isActiveTab);
        }

        dbPediaLookupUIOptions.bindListItemClickEvent();
        dbPediaLookupUIOptions.bindTabSelectEvent();
    },

    /**
     * Bind the list item click event
     *
     * @return void
     */
    bindListItemClickEvent : function() {
        $(".list").bind("click", function () {
            dbPediaLookupUIOptions.showTableOnListItemClick($(this).text());
        });
    },

    /**
     * Bind the tab selection event
     *
     * @return void
     */
    bindTabSelectEvent : function () {
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            dbPediaLookupUIOptions.selectedTabClass  = $(this).attr('class');
        });
    },

    /**
     * Bind the click event for each list item
     *
     * @param item
     *
     * @return void
     */
    showTableOnListItemClick : function (item) {
        var selectClass = '.modal-right.' + dbPediaLookupUIOptions.selectedTabClass;
        $(selectClass).html(
            dbPediaLookupUIOptions.getTabTable(dbPediaLookupUIOptions.selectedTabClass, dbPediaLookup.lookUpResult[item])
        );
    },

    /**
     * Build the modal to select the class URIS
     *
     * @param {string} tabId
     * @param {object} uriClasses uri with labels
     *
     * @return {string} html
     */
    getTabTable : function (tabId, uriClasses) {

        var uriRadioInputName = tabId + 'radioInput';

        var uris = uriClasses.URIs,
            classLabel =  uriClasses.labels, i = 0, tableHtml = '';

        tableHtml += "<tr class = 'showResult'>" +
            "<th class = 'showResult'>Class Label " + "</th>" +
            "<th class = 'showResult'>Class URIs</th>" +
            "<th class = 'showResult'>Selection</th>" +
            "</tr>";

        for (i = 0; i < uris.length; i++) {
            tableHtml += "<tr class = 'showResult'>";
            tableHtml += "<td class = 'showResult'>" + classLabel[i] + "</td>";
            tableHtml += "<td class = 'showResult'><a href='" + uris[i] + "'>" + uris[i] + "</a></td>";
            tableHtml += "<td class = 'showResult'><input type='radio' id='#' name='" + uriRadioInputName +"'></td>";
            tableHtml += "</tr>";
        }

        return "<table class = 'showResult' width='100%'>" + tableHtml + "</table>";
    },


    /**
     * Request to the dbpedia lookup to get all the result with uri and label and build the modal window
     *
     * @param {object} selectedElements
     *
     * @return void
     */
    getResultFromDbPediaLookup : function(selectedElements) {

        var classNames = ['person','place','place'];
        progressbar.showProgressBar('Querying DBpedia Lookup..');
        var i = 0, j = 0, columnArrayValues = null, keyword = null, className = '';
        for (i = 1; i < selectedElements.length; i++) {
            columnArrayValues = selectedElements[i];
            className = classNames[i];

            for (j = 0; j < columnArrayValues.length; j++) {
                keyword = columnArrayValues[j]

                if (dbPediaLookup.lookUpResult[keyword]  === undefined) {
                    dbPediaLookup.lookUpResult[keyword] = dbPediaLookup.getResources(keyword, classNames[j]);
                }
            }
        }
        dbPediaLookupUIOptions.buildOntologySelectionModal(selectedElements);
        progressbar.hideProgressBar();
    },

    /**
     * Get the list view for each column's rows
     *
     * @param {array} rows
     *
     * @returns {string} html
     */
    getRowsAsListView : function (rows) {

        var listHtml = '<ui class="list-group">',i = 0;
        for (i = 0; i < rows.length; i++) {
            listHtml += '<li class = "list-group-item"><a href="#" class="list">'+ rows[i] + '</a></li>';
        }
        listHtml += '<ui>';

        return listHtml;
    },

    /**
     * Add html content of each tab in the model
     *
     * @param {string} tabId tab id
     * @param {string} tabTitle tab title
     * @param {string} tabContent html content
     * @param {boolean} isActive
     *
     * @return void
     */
    addTabContent : function (tabId, tabTitle, tabContent, isActive) {

        var activeClass = '';
        if(isActive) {
            activeClass = 'active'
        }

        $('.nav-tabs').append(
            $('<li class="' + activeClass + '"></li>').append(
                $("<a>"+ tabTitle +"</a>").attr('href','#'+tabId).attr('data-toggle','tab').addClass(tabId)
            )
        );

        $('.tab-content').append(
            $('<div></div>').addClass('tab-pane ' + activeClass).attr('id', tabId).append(tabContent)
        );
    },

    /**
     * Reset the ontology selection tab model
     * @return void
     */
    resetOntologySelectionModalTabContent : function () {
        $('.modal-left').html('');
        $('.modal-right').html('');
        $('.nav-tabs').html('');
        $('.tab-content').html('');
    },

    /**
     * Get tab id after removing all the spaces between words
     * @param str
     * @returns {string}
     */
    getTabId : function (str) {
        return str.split(" ").join("");
    }
};
