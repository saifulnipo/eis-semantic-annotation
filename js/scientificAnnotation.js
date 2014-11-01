/**
This file is the main entry point for this tools for all the event
 that need to perform.

@authors : A Q M Saiful Islam, Jaana Takis
@dependency:
 {
    sparql.js
    highlight.js
 }
 */

var scientificAnnotation  = {

    GRAPH_NAME      : 'scientificAnnotation',
    GRAPH_NAME_EIS  : 'eisAnnotation',
    DEBUG           : true,

    // selected text position info
    selectedTextPosition:null,

    /**
     * bind the click event for
     * add annotation,
     * show similar search and
     * show available query
     *
     * @return void
     */
    bindClickEventForButtons: function () {

        $("#simpleAnnotateButton").bind("click", function () {
            scientificAnnotation.showSimpleAnnotatePanel($(this));
        });

        $("#addAnnotationButton").bind("click", function () {
            scientificAnnotation.addAnnotation();
        });

        $("#showSimilarSearchButton").bind("click", function () {
            scientificAnnotation.showSimilarSearchResult();
        });

        $("#queryButton").bind("click", function () {
            scientificAnnotation.fetchDataFromDatabase();
        });

        $("#annotateTableButton").bind("click", function () {
            scientificAnnotation.annotateTable($(this));
//            dbPediaLookup.makeAjaxRequest('Bonn');
        });

        $("#resetAnnotationButton").bind("click", function () {
            scientificAnnotation.resetAnnotation($(this));
        });
    },


    /**
     * show the simple annotate panel
     * @param button
     */
    showSimpleAnnotatePanel : function (button) {
        var simpleAnnotateWindow = $('#simpleAnnotatePanel'),
            tableAnnotationButton = $('#annotateTableButton');
        if (simpleAnnotateWindow.is(':visible')) {
            simpleAnnotateWindow.hide();
            tableAnnotationButton.attr('disabled' , false);
            button.text('Show Simple Annotate Panel');
        } else {
            simpleAnnotateWindow.fadeIn(500);
            button.text('Hide Simple Annotate Panel');
            tableAnnotationButton.attr('disabled' , true);
        }

        scientificAnnotation.resetAnnotationTable();
    },

    /**
     * Set auto compute data for property field
     *
     * @param properties
     * @return void
     *
     */
    setAutoComputeDataForPropertyField :function(properties){

        var propertyField = $('#propertyValueInput');
        propertyField.typeahead('destroy');
        propertyField.typeahead(
            {
                local: properties
             }
        );
    },

    /**
     * Set auto compute data for object field
     *
     * @param properties
     * @return void
     */
    setAutoComputeDataForObjectField :function(properties){

        var propertyField = $('#objectValueInput');
        propertyField.typeahead('destroy');
        propertyField.typeahead(
            {
                local: properties
             }
        );
    },

    /**
     * Set similar search result
     *
     * @param searchResult
     * @return void
     */
    setSimilarSearchResult :function(searchResult){

        var similarPubsList = $("#similarPubsList");

        if(searchResult.length > 0) {
            scientificAnnotation.hideAnnotationDisplayTable();
            similarPubsList.empty();
            for(var i = 0; i < searchResult.length; i++) {
                similarPubsList.append(
                    '<a href="'+searchResult[i]+'" class="list-group-item">'+searchResult[i]+'</a>'
                );
            }
            similarPubsList.fadeIn(500);// show the result
        } else {
            messageHandler.showWarningMessage('No similar result found.');
        }

    },

    /**
     * Return the selected Position details
     *
     * @returns {{start: number, end: number, rangyFragment: (highlight.rangy_serialize.Rangy|*), rangyPage: (highlight.rangy_serialize.Page|*)}}
     */
    getSelectionCharOffsetsWithin: function () {
        var currentPage =  $('#pageNumber').val();
        var element=document.body;
        var sel, range;
        var start = 0, end = 0, previousPagesCharCount = 0;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(sel.rangeCount - 1);
                start = scientificAnnotation.getBodyTextOffset(range.startContainer, range.startOffset,element);
                end = scientificAnnotation.getBodyTextOffset(range.endContainer, range.endOffset,element);
                sel.removeAllRanges();
                sel.addRange(range);
                previousPagesCharCount = scientificAnnotation.getPreviousPagesCharacterCount(currentPage);
            }
        }

        if(start > previousPagesCharCount) {
            start = start - previousPagesCharCount;
        }

        if(end > previousPagesCharCount){
            end = end - previousPagesCharCount;
        }

	var rangy_result = highlight.rangy_serialize();
	
        return {
            start: start,
            end: end,
            rangyFragment: rangy_result.Rangy,
            rangyPage: rangy_result.Page	
        };
    },

    /**
     * Get selected body text
     *
     * @param node
     * @param offset
     * @param element
     * @returns {Number}
     */
    getBodyTextOffset:function(node, offset,element) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        range.setEnd(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
        return sel.toString().length;
    },

    /**
     * Get the total character size of a single pdf page
     *
     * @param pageNumber
     * @returns {number}
     */
    getPageTotalCharLength : function(pageIndex){
        var count = 0;
        var textContent = PDFFindController.pdfPageSource.pages[pageIndex].getTextContent();
        if(textContent != null && textContent._value !== null){
            var lines = textContent._value.bidiTexts;
            var page_text = "";
            var last_block = null;
            for( var k = 0; k < lines.length; k++ ){
                var block = lines[k];
                if( last_block != null && last_block.str[last_block.str.length-1] != ' '){
                    if( block.x < last_block.x ){
                        page_text += "\r\n";
                    }
                    else if ( last_block.y != block.y && ( last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null ))
                        page_text += ' ';
                }
                page_text += block.str;
                last_block = block;
            }

            count = page_text.length;
        }

       return count;
   },

    /**
     * Get all characters before current page
     *
     * @param currentPage
     * @returns {number}
     */
    getPreviousPagesCharacterCount : function(currentPage){
        var previousPagesCharCount = 0;
            for(var i=0; i<currentPage -1;i++){
                previousPagesCharCount += scientificAnnotation.getPageTotalCharLength(i);
            }
        return previousPagesCharCount;
    },

    /**
     * bind mouse event for click in the page for select the document
     *
     * @return void
     */
    bindMouseUpEventForPDFViewer: function () {

        $("#viewer").bind("mouseup", function () {

            var text=scientificAnnotation.getSelectedTextFromPDF();
            if (text!='' && $('#simpleAnnotatePanel').is(':visible')) {
                scientificAnnotation.setTextValue(text);
                scientificAnnotation.selectedTextPosition = scientificAnnotation.getSelectionCharOffsetsWithin();
            }
        });
    },

    /**
     * bind the mouse click event in the displayed table rows to
     * highlight the subject part in the whole document
     * @return void
     */
    bindAnnotationTableSubjectClickEvent: function () {

        $('#sparqlTable').on('click', 'tr', function() {
            var subject = this.cells[0];  // the first <td>
            subject = subject.innerHTML
            if(subject != ''){
                subject = $.trim(subject);
                PDFFindBar.searchAndHighlight(subject);
            }
        });
    },

    /**
     * clear the values of input text field
     * @return void
     */
    clearInputField:function (){
        $('#propertyValueInput').val('');
        $('#subjectValueInput').val('');
        $('#objectValueInput').val('');
    },

    /**
     * set the input
     * @param selectedText
     * @return void
     */
    setTextValue:function(selectedText) {
        $('#subjectValueInput').val('');
        selectedText =selectedText.replace(/(\r\n|\n|\r)/gm,"");
        $('#subjectValueInput').val(selectedText);
    },

    /**
     * Get the selected text form pdf doc
     * @returns {string}
     */
    getSelectedTextFromPDF : function(){
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
        return '';
    },

    /**
     * perform the adding of  annotation
     * @return void
     */
    addAnnotation:function(){
        
       var propertyValue = $('#propertyValueInput').val();
       var subjectValue = $('#subjectValueInput').val();
       var objectValue = $('#objectValueInput').val();

        propertyValue = $.trim(propertyValue);
        subjectValue = $.trim(subjectValue);
        objectValue = $.trim(objectValue);

        var rangyFragment = null;
        var rangyPage = null;

        var textPosition = scientificAnnotation.selectedTextPosition;
        var startPos = 0, endPos = 0;

        if(textPosition != null){
            startPos = textPosition.start;
            endPos = textPosition.end;
            rangyFragment = textPosition.rangyFragment;
            rangyPage = textPosition.rangyPage;
        }
	
       if(propertyValue != '' && subjectValue!= '' && objectValue!= '') {
           progressbar.showProgressBar('Adding annotation...');
           scientificAnnotation.appendAnnotationInDisplayPanel(propertyValue,subjectValue, objectValue);
           sparql.addAnnotation(propertyValue,subjectValue, objectValue, startPos, endPos, rangyPage, rangyFragment);
           scientificAnnotation.clearInputField();
       } else {
           messageHandler.showErrorMessage('Empty fields. Please filled up all and try again',true);
       }
    },

    /**
     * Show the added annotation of the document
     * @param propertyValue
     * @param subjectValue
     * @param objectiveValue
     * @return void
     */
    appendAnnotationInDisplayPanel : function (propertyValue, subjectValue, objectValue){

        var previousHtml = $('#displayAnnotationResult').html();
        scientificAnnotation.clearAnnotationDisplayPanel();
        $('#displayAnnotationResult').append(
                '<p><strong>Subject:</strong></br>'+subjectValue+'</p>' +
                '<p><strong>Property:</strong></br>'+propertyValue+'</p>' +
                '<p><strong>Object:</strong></br>'+objectValue+'</p></br>'+
                 previousHtml
        );
    },

    /**
     *  Reset and refresh necessary parameter and variable once new pdf file has been laoded
     */
    refreshOnNewPdfFileLoad : function () {
        tableAnnotator.TABLE_ANNOTATION_COUNT = 1;
        scientificAnnotation.clearInputField();
        scientificAnnotation.resetAnnotationTable();
        scientificAnnotation.clearAnnotationDisplayPanel();
        scientificAnnotation.clearSimilarSearchResult();
        highlight.init();
    },

    /**
     * clear available annotations
     */
    clearAnnotationDisplayPanel:function (){
        $('#displayAnnotationResult').empty();
    },

    /**
     * clear the similar search window and hide
     */
    clearSimilarSearchResult:function(){
        var similarPubsList = $("#similarPubsList");
        similarPubsList.empty();
        similarPubsList.fadeOut(300);
    },

    /**
     * Reset the annotation display tables
     * @return void
     */
    resetAnnotationTable:function (){
        scientificAnnotation.hideAnnotationDisplayTable();
    },

    /**
     * Show the added annotation of the document from spaql
     * @param propertyValue
     * @param subjectValue
     * @param objectiveValue
     * @return void
     */
    addDataToSparqlTableView : function (subjectValue ,propertyValue, objectValue){

        $('#sparqlTable tr:last').after(
            '<tr>' +
                '<td>'+subjectValue+'</td>' +
                '<td>'+propertyValue+'</td>' +
                '<td>'+objectValue+'</td>' +
                '</tr>'
        );
    },

    /**
     * Create the tables for viewing the available data from the db
     * @return void
     */
    createSparqlTable:function(){
        $('#displayTableTitle').empty();
        $('#displayTableTitle').append(
            '<br><p>Available annotation of this file:::</p><br>'
        );

        $('#displaySparqlTableRows').empty();
        $('#displaySparqlTableRows').append(
            "<table id='sparqlTable' width='100%' >"+
                "<tr>"+
                    "<th width='50%'> Subject </th> <th width='20%'> Property </th> <th width='30%'> Object </th>"+
                "</tr>"+
            "</table>"
        );

        scientificAnnotation.bindAnnotationTableSubjectClickEvent();
    },

    /**
     * Showing the available annotation tables
     * @return void
     */
    displayAvailableAnnotationFromSparql:function(){

        scientificAnnotation.clearAnnotationDisplayPanel();
        $('#displayTableTitle').show();
        scientificAnnotation.createSparqlTable();
        $('#displaySparqlTableRows').show();
    },

    /**
     * Showing the available annotation tables
     * @return void
     */
    noAvailableAnnotationFromSparql:function(){
        messageHandler.showWarningMessage('No available annotation found  of this file');
        progressbar.hideProgressBar();
    },

    /**
     * Hide the available annotation table
     * @return void
     */
    hideAnnotationDisplayTable:function(){
        $('#displayTableTitle').empty();
        $('#displayTableTitle').hide();
        $('#displaySparqlTableRows').empty();
        $('#displaySparqlTableRows').hide();
    },

    /**
     * Fetch the data from database
     * @return void
     */
    fetchDataFromDatabase : function () {
        var outputTable = $('#displaySparqlTableRows');
        var displayFileInfoTitle = $('#displayTableTitle');
        scientificAnnotation.clearSimilarSearchResult();
        scientificAnnotation.resetAnnotation(null);
        progressbar.showProgressBar('Loading data ....');
        sparql.showDataFromSparql();
        outputTable.fadeIn(500);
        displayFileInfoTitle.fadeIn(500);
    },

    /**
     *  Annotate tabular structure in pdf file
     *  @return void
     */
    annotateTable : function(button) {

        var displaySelectedTable = $('#viewSelectedInfoFromPfdTable');
        if (!displaySelectedTable.is(':visible')) {
            tableAnnotator.annotateSelectedTable();
        } else {
            button.text('Annotate table');
            $('#resetAnnotationButton').hide();
            displaySelectedTable.hide();

            if (tableAnnotator.storedData !== null) {
                dataCubeSparql.addAnnotation(tableAnnotator.storedData);
            }
        }
    },


    /**
     * Reset the annotation area
     * @param button
     */
    resetAnnotation : function(button) {
        $('#viewSelectedInfoFromPfdTable').empty();
        $('#viewSelectedInfoFromPfdTable').hide();
        $('#annotateTableButton').text('Annotate table');

        $('#ontologyClassSelectionPanel').empty();
        $('#ontologyClassSelectionContainer').hide();

        tableAnnotator.storedData = null;

        if (button !== null) {
            button.hide();
        }
    },

    /**
     * Display similar search
     * @return void
     */
    showSimilarSearchResult:function(){
        var similarPubsList = $("#similarPubsList");
        if (similarPubsList.is(':visible')) {
            similarPubsList.fadeOut(300);
        }

        progressbar.showProgressBar('Finding similar result...');
        sparql.findSimilarFiles();

    },

    /**
     *  An event that is fired by PDF.js when the pdf loads.
     *  @return {void}
     */
    bindDocumentLoadEvent : function () {
        window.addEventListener("documentload", function(evt) {
            scientificAnnotation.refreshOnNewPdfFileLoad();
        }, false);
    },

    /**
     * Initialize the document
     *
     * @return void
     */
    init:function(){
        scientificAnnotation.refreshOnNewPdfFileLoad();
        scientificAnnotation.bindDocumentLoadEvent();
        scientificAnnotation.bindClickEventForButtons();
        scientificAnnotation.bindMouseUpEventForPDFViewer();
        sparql.bindAutoCompleteProperty();
        sparql.bindAutoCompleteObject();
    }
};

/**
 * document on ready method
 */
$(function () {
    applicationSettings.setUp();

    if (applicationSettings.isUnitTestOngoing) {
        return;
    }
    scientificAnnotation.init();
});