/**
 This file setup the additional information for the application while it load first time.
 @authors : A Q M Saiful Islam
 */

/*global scientificAnnotation :false */

var applicationSettings  = {

    // annotation prefixes
    PREFIX_CUBE     : "http://purl.org/linked-data/cube#",
    PREFIX_DCT      : "http://purl.org/dc/terms/",
    PREFIX_RDF      : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    PREFIX_RDFS     : "http://www.w3.org/2000/01/rdf-schema#",
    PREFIX_XSD      : "http://www.w3.org/2001/XMLSchema#",
    PREFIX_SEMANN   : "http://eisAnnotation/#",
    PREFIX_EX       : "http://example.org/ns#",

    setUp: function () {
        applicationSettings.setUpForDimensionProperty();
    },

    /**
     * Check if the dimensions is available in the backend
     * @return void
     */
    setUpForDimensionProperty: function () {
         var query =
            'prefix qb: <' + dataCubeSparql.PREFIX_CUBE + '>' + '\n' +
            'prefix semann: <' + dataCubeSparql.PREFIX_SEMANN + '>' + '\n' +
            'ASK ' + '\n' +
            '{' + '\n' +

            'semann:column ?o qb:DimensionProperty.' + '\n' +
            'semann:row ?o qb:DimensionProperty.' + '\n' +
            'semann:value ?o qb:MeasureProperty' + '\n' +

            '}';

        $.ajax({
            type: "POST",
            url: sparql.SERVER_ADDRESS,
            data: {
                query: query,
                format: "application/json"
            },
            success: function (response) {
                applicationSettings.insertDimensionAndProperty(response.boolean);
            },
            error: function (jqXHR, exception) {
                messageHandler.showErrorMessage(errorTxt);
            }
        });
    },

    /**
     * prepare and send the ajax request for add annotation as a data cube
     * @param selectedTableCellTexts
     *
     * @return void
     */
    insertDimensionAndProperty: function (isDimensionAvailable) {

        if (isDimensionAvailable === true) {
            return;
        }

        progressbar.showProgressBar('Setting up application set up...');
        var query =
                'prefix qb: <' + dataCubeSparql.PREFIX_CUBE + '>' + '\n' +
                'prefix dct: <' + dataCubeSparql.PREFIX_DCT + '>' + '\n' +
                'prefix rdf: <' + dataCubeSparql.PREFIX_RDF + '>' + '\n' +
                'prefix rdfs: <' + dataCubeSparql.PREFIX_RDFS + '>' + '\n' +
                'prefix xsd: <' + dataCubeSparql.PREFIX_XSD + '>' + '\n' +
                'prefix semann: <' + dataCubeSparql.PREFIX_SEMANN + '>' + '\n' +
                'prefix ex: <' + dataCubeSparql.PREFIX_EX + '>' + '\n' +

                'INSERT IN ' + '<' + scientificAnnotation.GRAPH_NAME_EIS + '> ' + '\n' +
                '{ ' + '\n' +
                    applicationSettings.getDimensionAndProperty() + '\n' +
                '}';

        $.ajax({
            type: "POST",
            url: sparql.SERVER_ADDRESS,
            data: {
                query: query,
                format: "application/json"
            },
            success: function (response) {
                progressbar.hideProgressBar();
                messageHandler.showSuccessMessage('Application set up for dimension property success');
            },
            error: function (jqXHR, exception) {
                var errorTxt= sparql.getStandardErrorMessage(jqXHR, exception);
                progressbar.hideProgressBar();
                messageHandler.showErrorMessage(errorTxt);
            }
        });
    },

    /**
     * Get the dimension and properties of the data cube
     * @returns {string}
     */
    getDimensionAndProperty: function () {
        var query =
            'semann:row a rdf:Property, qb:DimensionProperty ;' + '\n' +
            'rdfs:label "row"@en ;' + '\n' +
            'rdfs:comment "a row of a table"@en ;' + '\n' +
            'rdfs:range xsd:nonNegativeInteger .' + '\n' +

            'semann:column a rdf:Property, qb:DimensionProperty ;' + '\n' +
            'rdfs:label "column"@en ;' + '\n' +
            'rdfs:comment "a column of a table"@en ;' + '\n' +
            'rdfs:range xsd:nonNegativeInteger .' + '\n' +

            'semann:value a rdf:Property, qb:MeasureProperty ;' + '\n' +
            'rdfs:label "value"@en ;' + '\n' +
            'rdfs:comment "the value of a table cell"@en ;' + '\n' +
            'rdfs:range rdfs:Literal .' + '\n' +

            'ex:table1Row a rdf:Property, qb:DimensionProperty ;' + '\n' +
            'rdfs:subPropertyOf semann:row .' + '\n' +

            'ex:table1Column a rdf:Property, qb:DimensionProperty ;' + '\n' +
            'rdfs:subPropertyOf semann:column .';

        return query;
    }
};
