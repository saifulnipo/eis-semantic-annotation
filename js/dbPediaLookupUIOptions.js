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

    CLASS_NO_SELECTION   : '--none--',

    CLASS_AUTO_SELECTION : 'auto',
    /**
     * Ontology look up classes
     */
    ontologyClasses : [ '--none--', 'auto', 'Place', 'Person', 'Work', 'Species', 'Organisation'],

    /**
     * Cache current selected tab's class name
     */
    selectedTabClass : null,


    /**
     * Map the the search key with radio items id, names and values
     */
    searchKeyValueRadioInputMap : {},

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

        var columnValue = '',i = 0,ontologyClassListId = '';
        for (i = 0; i < columnNames.length; i++) {
            ontologyClassListId = dbPediaLookupUIOptions.getCustomId(columnNames[i]);
            columnValue += "<tr class = 'showResult'>";
            columnValue += "<td class = 'showResult'>" + columnNames[i] + "</td>";
            columnValue += "<td class = 'showResult'>" + dbPediaLookupUIOptions.getListOptions() + "</td>";
            columnValue += "</tr>";
        }

        ontologyDisplayOptionPanel.append(
            "<table class = 'showResult' width='auto'>" + columnValue + "</table>"
        );

        dbPediaLookupUIOptions.bindOntologyClassListChangeEvent();
    },

    /**
     * Get the html for a list
     *
     * @param {string} id html id
     *
     * @returns {string} html
     */
    getListOptions : function() {

        var html = '<select class="ontologyClassSelection">\n';
        $.each(dbPediaLookupUIOptions.ontologyClasses, function(index, value) {
            html += '<option value="' + value + '" >' + value + '</option>\n';
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
            radioInputName = '', isActiveTab = false;



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
            tabId = dbPediaLookupUIOptions.getCustomId(columnName);

            // assign the 1st tab class name
            if (dbPediaLookupUIOptions.selectedTabClass === null) {
                dbPediaLookupUIOptions.selectedTabClass = tabId;
            }

            var rightClass = 'modal-right '+tabId;

            tabLeftContent = "<div class='modal-left'>" + dbPediaLookupUIOptions.getRowsAsListView(listValues) +"</div>",
                tabRightContent = "<div class='" + rightClass +"'>" + dbPediaLookupUIOptions.getTabTable(tabId, firstSearchKey)+ '</div>';
            tabContent = tabLeftContent+ tabRightContent;
            dbPediaLookupUIOptions.addTabContent(tabId, columnName, tabContent, isActiveTab);
        }

        dbPediaLookupUIOptions.bindListItemClickEvent();
        dbPediaLookupUIOptions.bindTabSelectEvent();
        dbPediaLookupUIOptions.bindCellRadioSelection();
    },

    /**
     * Bind the list item click event
     *
     * @return void
     */
    bindOntologyClassListChangeEvent : function() {
        $(".ontologyClassSelection").bind("change", function () {
            $("#getResourceUriButton").attr('disabled' , true);
            dbPediaLookup.clearDbPediaLookupResultCache();

            $(".ontologyClassSelection").each(function() {
                if ($(this).val() !== dbPediaLookupUIOptions.CLASS_NO_SELECTION) {
                    $("#getResourceUriButton").attr('disabled' , false);
                    return;
                }
            });
        });
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
     * Bind the list item click event
     *
     * @return void
     */
    bindCellRadioSelection : function() {
        $(".cellRadioSelection").bind("click", function () {
            var name = $(this).attr('name'),
                id = $(this).attr('id'),
                value = $(this).val();

            var previous = dbPediaLookupUIOptions.searchKeyValueRadioInputMap[name];
                previous.id = id;
                previous.value = value;
                dbPediaLookupUIOptions.searchKeyValueRadioInputMap[name] = previous;
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
            dbPediaLookupUIOptions.getTabTable(dbPediaLookupUIOptions.selectedTabClass, item)
        );
        dbPediaLookupUIOptions.bindCellRadioSelection();
    },

    /**
     * Build the modal to select the class URIS
     *
     * @param {string} tabId
     * @param {object} uriClasses uri with labels
     *
     * @return {string} html
     */
    getTabTable : function (tabId, searchKey) {

        var uriClasses = dbPediaLookup.lookUpResult[searchKey];
        if (uriClasses === null || uriClasses === undefined) {
            return '';
        }

        var uriRadioInputName = dbPediaLookupUIOptions.getCustomId(searchKey), checked = '';

        var uris = uriClasses.URIs,
            classLabel =  uriClasses.labels, i = 0, tableHtml = '';

        if ($.isEmptyObject(uris)) {
            return '';
        }



        tableHtml += "<tr class = 'showResult'>" +
            "<th class = 'showResult'>Class Label " + "</th>" +
            "<th class = 'showResult'>Class URIs</th>" +
            "</tr>";

        for (i = 0; i < uris.length; i++) {

            checked = '';

            if (i === dbPediaLookupUIOptions.getIndexFromId(uriRadioInputName)) {
                checked = 'checked';
            }
            tableHtml += "<tr class = 'showResult'>";
            tableHtml += "" +
                "<td class = 'showResult'>" +
                    "<input " +
                        "type='radio' " +
                        "id='" + uriRadioInputName + "_" + i + "' " + // keep track of the index id: name_index (loop)
                        "class='cellRadioSelection' " +
                        "name='" + uriRadioInputName +"' " +
                        "value = '" + uris[i] + "'" +
                        checked +
                    ">&nbsp;&nbsp;" + classLabel[i]
                "</td>";

            tableHtml += "<td class = 'showResult'><a href='" + uris[i] + "' target='_blank'>" + uris[i] + "</a></td>";

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

        var classNames = [], dbPediaResult = null ;

        $( ".ontologyClassSelection" ).each(function() {
            classNames.push($( this ).val());
        });
        dbPediaLookupUIOptions.resetOntologySelectionModalTabContent();
        progressbar.showProgressBar('Querying DBpedia Lookup..');
        var i = 0, j = 0, columnArrayValues = null, keyword = null, className = '';
        for (i = 1; i < selectedElements.length; i++) {
            columnArrayValues = selectedElements[i];
            className = classNames[i];

            for (j = 0; j < columnArrayValues.length; j++) {
                keyword = columnArrayValues[j]

                progressbar.showProgressBar('Querying in DBpedia Lookup..' + keyword);

                if (dbPediaLookup.lookUpResult[keyword]  === undefined) {
                    dbPediaResult = dbPediaLookup.getResources(keyword, classNames[j]);
                    dbPediaLookup.lookUpResult[keyword] = dbPediaResult;
                    dbPediaLookupUIOptions.mapDbPediaResultWithSearchKey(keyword, dbPediaResult.URIs[0]);
                }
            }
        }
        dbPediaLookupUIOptions.buildOntologySelectionModal(selectedElements);
        progressbar.hideProgressBar();
    },

    /**
     * Get the list view for each column's rows
     *
     * @param {object} rows
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
        dbPediaLookupUIOptions.searchKeyValueRadioInputMap = {}; // clear the cache
    },

    /**
     * Get tab id after removing all the spaces between words
     * @param str
     * @returns {string}
     */
    getCustomId : function (str) {
        return str.split(" ").join("");
    },

    /**
     * Return the index from the id name i.e. 'sample_10' will return 10
     * @return int
     */
    getIndexFromId : function (radioInputId) {

        radioInputId = dbPediaLookupUIOptions.searchKeyValueRadioInputMap[radioInputId];

        if (radioInputId === null || radioInputId === undefined){
            return 0;
        }

        var i = 0, index = 0, sub_str = '', id = radioInputId.id;

        if ((i = id.indexOf('_')) !== -1) {
            sub_str = id.substring(i + 1);
            index = parseInt(sub_str);
        }

        if (isNaN(index)) {
            index = 0;
        }

        return index;
    },

    /**
     *
     */
    mapDbPediaResultWithSearchKey : function(searchKey, uri) {
        var uriRadioInputName  = dbPediaLookupUIOptions.getCustomId(searchKey);
        dbPediaLookupUIOptions.searchKeyValueRadioInputMap[uriRadioInputName] = {
            id : '',
            value : uri,
            searchKey : searchKey
        }
    },

    /**
     * Get all the value from the model
     */
    getSelectedValueFromModel : function() {
        tableAnnotator.generateHtmlTableForSelectedInfo(tableAnnotator.storedData);
    }
};