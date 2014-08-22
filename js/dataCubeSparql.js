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
     * @param selectedRows
     * @param selectedColumns
     */
    addAnnotation:function(selectedTableCellTexts, selectedRows, selectedColumns){

        console.log('selectedRows::: '+selectedRows);
        console.log('selectedColumns:: '+selectedColumns);
        console.log(selectedTableCellTexts);


        var insertQuery =
            'prefix qb: <'+dataCubeSparql.PREFIX_CUBE+'>' +'\n'+
            'prefix dct: <'+dataCubeSparql.PREFIX_SEMANN+'>' +'\n'+
            'prefix rdf: <'+dataCubeSparql.PREFIX_SEMANN+'>' +'\n'+
            'prefix rdfs: <'+dataCubeSparql.PREFIX_SEMANN+'>' +'\n'+
            'prefix xsd: <'+dataCubeSparql.PREFIX_SEMANN+'>' +'\n'+
            'prefix semann: <'+dataCubeSparql.PREFIX_SEMANN+'>'+'\n'+
            'prefix ex: <'+dataCubeSparql.PREFIX_EX+'>'+'\n'+

            'INSERT IN ' + '<'+scientificAnnotation.GRAPH_NAME_EIS+'> ' +'\n'+
            '{ ' +'\n'+

                dataCubeSparql.getDataSet()+'\n'+
                dataCubeSparql.getDataStructureDefinition()+'\n'+
                dataCubeSparql.getDimensionAndProperty()+'\n'+
                dataCubeSparql.getObservations()+'\n'+

            '}';

        $.ajax({
            type: "GET",
            url: sparql.SERVER_ADDRESS,
            data: {
                query: insertQuery,
                format: "application/json"
            },
            async: true,
            dataType: "jsonp",
            crossDomain: true,
            cache: false,
            success: function(response){
//                sparql.bindAutoCompleteProperty();
//                sparql.bindAutoCompleteObject();
                scientificAnnotation.hideAnnotationDisplayTable();
                scientificAnnotation.hideProgressBar();
                scientificAnnotation.showSuccessMessage('Table annotation successfully added');
            },
            error: function(jqXHR, exception){
                var errorTxt= sparql.getStandardErrorMessage(jqXHR ,exception);
                scientificAnnotation.hideProgressBar();
                scientificAnnotation.showErrorMessage(errorTxt);
            }
        });
    },


    /**
     * Return the camelCase of a sentences (Hello World --> helloWorld)
     *
     * @param str
     * @returns {XML|string|void|*}
     */
    camelCase :function (str){
        str     = $.camelCase(str.replace(/[_ ]/g, '-')).replace(/-/g, '');
        return  str;
    },
    
    /**
     * Return the URI of resources to be used in sparql queries.
     *
     * @param optional file fragment location 
     * @returns object with resources you can use in sparql queries.
     */
    resource :function (fragment) {

        var fileURI = sparql.PREFIX_FILE + encodeURI(document.title.toString());
        var excerptURI = fileURI + fragment;
        var hasExcerptURI = sparql.PREFIX_PUB + 'hasExcerpt';

        return {
            File:			'<'+fileURI+'>',
            hasExcerpt:	'<'+hasExcerptURI+'>',
            label:			'<'+sparql.PREFIX_RDFS+'label>',
            Publication:		'<'+sparql.PREFIX_PUB+'Publication>',
            Excerpt:		'<'+excerptURI+'>'
        }
    },

    /**
     * Return the standard error message if the server communication is failed
     *
     * @param exception
     * @param jqXHR
     */
    getStandardErrorMessage:function(jqXHR, exception){
        var errorTxt = "Error occurred when sending data to the server: "+ sparql.SERVER_ADDRESS;

        if (jqXHR.status === 0) {
            errorTxt = errorTxt + '<br>Not connected. Verify network.';
        } else if (jqXHR.status == 404) {
            errorTxt = errorTxt + '<br>Request cannot be fulfilled by the server. Check whether the <br />(a) sparql endpoint is available at the above address <br>(b) query contains bad syntax.';
        } else if (jqXHR.status == 500) {
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
     * @returns {string}
     */
    getDataSet: function() {
        var query =
            'ex:table1 a qb:DataSet ;' +'\n'+
            'dct:isPartOf <.../TheDocument> ;' +'\n'+
            'qb:structure ex:dsdTable1 ;' +'\n'+
            'qb:slice ex:sliceA, ex:sliceB, ex:sliceC .';

        return query;
    },

    /**
     * Return the structure of the data cube
     * @returns {string}
     */
    getDataStructureDefinition: function () {
        var query =
            'ex:dsdTable1 a qb:DataStructureDefinition ;' +'\n'+
            'qb:component [ qb:dimension ex:row ; qb:order 1 ];' +'\n'+
            'qb:component [ qb:dimension ex:column ;qb:order 2 ];' +'\n'+
            'qb:component [ qb:measure semann:value ] .';

        return query;
    },

    /**
     * Get the dimension and properties of the data cube
     * @returns {string}
     */
    getDimensionAndProperty: function () {
        var query =
            'semann:row a rdf:Property, qb:DimensionProperty ;' +'\n'+
            'rdfs:label "row"@en ;' +'\n'+
            'rdfs:comment "a row of a table"@en ;' +'\n'+
            'rdfs:range xsd:nonNegativeInteger .' +'\n'+

            'semann:column a rdf:Property, qb:DimensionProperty ;' +'\n'+
            'rdfs:label "column"@en ;' +'\n'+
            'rdfs:comment "a column of a table"@en ;' +'\n'+
            'rdfs:range xsd:nonNegativeInteger .' +'\n'+

            'semann:value a rdf:Property, qb:MeasureProperty ;' +'\n'+
            'rdfs:label "value"@en ;' +'\n'+
            'rdfs:comment "the value of a table cell"@en ;' +'\n'+
            'rdfs:range rdfs:Literal .' +'\n'+

            'ex:row a rdf:Property, qb:DimensionProperty ;' +'\n'+
            'rdfs:subPropertyOf semann:row .' +'\n'+

            'ex:column a rdf:Property, qb:DimensionProperty ;' +'\n'+
            'rdfs:subPropertyOf semann:column .';

        return query;
    },

    /**
     * Get the observation based on selection
     * @returns {string}
     */
    getObservations: function () {
        var query =
            'ex:table1A2 a qb:Observation ;' +'\n'+
            'qb:dataSet ex:table1 ;' +'\n'+
            'ex:row 2 ;' +'\n'+
            'ex:column 1;' +'\n'+
            'semann:value "1" .' +'\n'+

            'ex:table1B2 a qb:Observation ;' +'\n'+
            'qb:dataSet ex:table1 ;' +'\n'+
            'ex:row 2 ;' +'\n'+
            'ex:column 2 ;' +'\n'+
            'semann:value "Spain" .' +'\n'+

            'ex:table1C2 a qb:Observation ;' +'\n'+
            'qb:dataSet ex:table1 ;' +'\n'+
            'ex:row 2 ;' +'\n'+
            'ex:column 3 ;' +'\n'+
            'semann:value "UEFA" .';

        return query;
    }

};
