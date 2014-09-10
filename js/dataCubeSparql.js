/**
 This file contain all the necessary sparql related queries,
 that need to perform.

 @authors : A Q M Saiful Islam
 @dependency
 {
    scientificAnnotation.js
    highlight.js
 }
 */

/*global scientificAnnotation :false */

var dataCubeSparql  = {

    // annotation prefixes
    PREFIX_CUBE     : "http://purl.org/linked-data/cube#",
    PREFIX_DCT      : "http://purl.org/dc/terms/",
    PREFIX_RDF      : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    PREFIX_RDFS     : "http://www.w3.org/2000/01/rdf-schema#",
    PREFIX_XSD      : "http://www.w3.org/2001/XMLSchema#",
    PREFIX_SEMANN   : "http://eisAnnotation/#",
    PREFIX_EX       : "http://example.org/ns#",

    /**
     * prepare and send the ajax request for add annotation as a data cube
     * @param selectedTableCellTexts
     *
     * @return void
     */
    addAnnotation: function (selectedTableCellTexts) {

        if ($.isEmptyObject(selectedTableCellTexts)) {
            return;
        }

        var selectedColumns = selectedTableCellTexts[0].length;

        progressbar.showProgressBar('Adding annotation to the selected table...');
        var query =
            'prefix qb: <' + dataCubeSparql.PREFIX_CUBE + '>' + '\n' +
            'prefix dct: <' + dataCubeSparql.PREFIX_DCT + '>' + '\n' +
            'prefix rdf: <' + dataCubeSparql.PREFIX_RDF + '>' + '\n' +
            'prefix rdfs: <' + dataCubeSparql.PREFIX_RDFS + '>' + '\n' +
            'prefix xsd: <' + dataCubeSparql.PREFIX_XSD + '>' + '\n' +
            'prefix semann: <' + dataCubeSparql.PREFIX_SEMANN + '>' + '\n' +
            'prefix ex: <' + dataCubeSparql.PREFIX_EX + '>' + '\n' +

            'INSERT IN ' + '<' + scientificAnnotation.GRAPH_NAME_EIS +'> ' + '\n' +
            '{ ' + '\n' +

                dataCubeSparql.getDataSet(selectedColumns) + '\n' +
                dataCubeSparql.getDataStructureDefinition() + '\n' +
                dataCubeSparql.getObservations(selectedTableCellTexts) + '\n' +

            '}';

//        console.log(query);

        $.ajax({
            type: "POST",
            url: sparql.SERVER_ADDRESS,
            data: {
                query: query,
                format: "application/json"
            },
            success: function (response) {
                scientificAnnotation.hideAnnotationDisplayTable();
                progressbar.hideProgressBar();
                messageHandler.showSuccessMessage('Table annotation successfully added');
                tableAnnotator.TABLE_ANNOTATION_COUNT++;
            },
            error: function(jqXHR, exception) {
                var errorTxt= sparql.getStandardErrorMessage(jqXHR, exception);
                progressbar.hideProgressBar();
                messageHandler.showErrorMessage(errorTxt);
            }
        });
    },

    /**
     * Return the document URI with name
     * @returns {string}
     */
    getDocumentURI : function () {
        var pageNumber = '#page=' + $('#pageNumber').val(),
            tableName = '?name=table' + tableAnnotator.TABLE_ANNOTATION_COUNT,
            documentURI = sparql.PREFIX_FILE + encodeURI(document.title.toString()) + pageNumber + tableName;
        return documentURI;
    },

    /**
     * Return the standard error message if the server communication is failed
     *
     * @param exception
     * @param jqXHR
     */
    getStandardErrorMessage : function (jqXHR, exception) {
        var errorTxt = "Error occurred when sending data to the server: "+ sparql.SERVER_ADDRESS;

        if (jqXHR.status === 0) {
            errorTxt = errorTxt + '<br>Not connected. Verify network.';
        } else if (jqXHR.status === 404) {
            errorTxt = errorTxt + '<br>Request cannot be fulfilled by the server. Check whether the <br />(a) sparql endpoint is available at the above address <br>(b) query contains bad syntax.';
        } else if (jqXHR.status === 500) {
            errorTxt = errorTxt + '<br>Internal server error [500].';
        } else if (exception === 'parsererror') {
            errorTxt = errorTxt + '<br>Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            errorTxt = errorTxt + '<br>Timeout error.';
        } else if (exception === 'abort') {
            errorTxt = errorTxt + '<br>Ajax request aborted.';
        } else {
            errorTxt = errorTxt + '<br>Uncaught Error.\n' + jqXHR.responseText;
        }

        return errorTxt;
    },

    /**
     * Return the data set fo the data cube structure
     * @param {int} selectedColumns
     * @param {int} tableNameCounter
     * @returns {string}
     */
    getDataSet: function (selectedColumns) {

        var slices = '',
            query = '',
            documentURI = dataCubeSparql.getDocumentURI();
        for (var i= 0; i < selectedColumns; i++) {
            slices += 'ex:sliceC'+(i+1)+',';
        }
        slices = slices.substring(0,slices.length-1);
        query =
            'ex:table1 a qb:DataSet ;' + '\n' +
            'dct:isPartOf <' + documentURI + '> ;' + '\n' +
            'qb:structure ex:dsdTable1 ;' + '\n' +
            'qb:slice ' + slices + ' .';
        return query;
    },

    /**
     * Return the structure of the data cube
     * @returns {string}
     */
    getDataStructureDefinition: function () {
        var query =
            'ex:dsdTable1 a qb:DataStructureDefinition ;' +'\n'+
            'qb:component [ qb:dimension ex:table1Row ; qb:order 1 ];' +'\n'+
            'qb:component [ qb:dimension ex:table1Column ;qb:order 2 ];' +'\n'+
            'qb:component [ qb:measure semann:value ] .';

        return query;
    },

    /**
     * Get the observation based on selection
     * @param selectedTableCellTexts
     * @returns {string}
     */
    getObservations: function (selectedTableCellTexts) {

        var observationTitle = '',
            observationQuery = '';

        // i = 1, because we skip the 1st row so there will be one less loop
        for(var i = 1; i<selectedTableCellTexts.length; i++) {
            for(var j = 0; j<selectedTableCellTexts[j].length; j++) {
                observationTitle = 'R' + i + 'C' + (j+1);
//                console.log(selectedTableCellTexts[i][j]);

                observationQuery +=
                    'ex:'+ observationTitle +' a qb:Observation ;' +'\n'+
                    'qb:dataSet ex:table1 ;' +'\n'+
                    'ex:table1Row '+ (i+1) +' ;' +'\n'+
                    'ex:table1Column '+ (j+1) +' ;' +'\n'+
                    'semann:value "'+ selectedTableCellTexts[i][j] +'" .' +'\n';
            }
        }
        return observationQuery;
    }

};
