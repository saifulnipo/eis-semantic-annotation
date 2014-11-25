/**
 This file contain all the necessary DBpedia Lookup (https://github.com/dbpedia/lookup) related queries,

 @authors : Jaana Takis, AQM Saiful Islam
 @dependency
 {
    scientificAnnotation.js
    progressbar.js
    messageHandler.js
 }
 */

var dbPediaOwlType  = {

    /**
     * cache the dbPedia owl class typ
     */
    owlClassList : {},

    /**
     * prepare an ajax call for contacting DBpedia Lookup service. This allows us to transform literals into classes.
     *
     * @param {String} keyword to be passed on as a parameter to the service
     *
     * @return {object}
     */

    loadClasses: function() {

        if (!$.isEmptyObject(dbPediaOwlType.owlClassList)){
            return;
        }

        progressbar.showProgressBar('Please wait a moment!! Loading owl class types from dbpedia.org');

        var selectQuery = "SELECT distinct str(?label) as ?name, ?type " + '\n' +
            "WHERE " + '\n' +
                "{ " + '\n' +
                    "?type a owl:Class . " + '\n' +
                    "?type rdfs:label  ?label " + '\n' +
                    "FILTER (lang(?label) = 'en') " + '\n' +
                "}" + '\n' +
            "Order by (LCASE(str(?name)))";
        $.ajax({
            type: "POST",
            url: sparql.DBPEDIA_SERVER_ADDRESS,
            data: {
                query: selectQuery,
                format: "application/json"
            },
            success: function(response){
                dbPediaOwlType.parseResponse(response);
                progressbar.hideProgressBar();
            },
            error: function(jqXHR, exception){
                var errorTxt= sparql.getStandardErrorMessage(jqXHR,exception);
                progressbar.hideProgressBar();
                messageHandler.showErrorMessage(errorTxt);
            }
        });
    },

    /**
     * Parse the response the return the URIs with their label
     *
     * @param {JSON} response object.
     *
     * @return String containing formatted DBpedia response,
     */
    parseResponse : function(response){

        var typeName = '', typeUri = '';

        $.each(response, function(name, value) {
            if(name == 'results'){
                dbPediaOwlType.owlClassList[dbPediaLookupUIOptions.CLASS_NO_SELECTION] = dbPediaLookupUIOptions.CLASS_NO_SELECTION;
                dbPediaOwlType.owlClassList[dbPediaLookupUIOptions.CLASS_AUTO_SELECTION] = dbPediaLookupUIOptions.CLASS_AUTO_SELECTION;
                $.each(value.bindings, function(index,item) {
                    typeName = dbPediaOwlType.capitalise(item.name.value);
                    typeUri = item.type.value;
                    if (typeUri.indexOf('http://dbpedia.org')!== -1 && dbPediaOwlType.owlClassList[typeName] === undefined) {
                        dbPediaOwlType.owlClassList[typeName] = typeUri;
                    }
                });
            }
        });
    },

    /**
     * Return the standard error message if the server communication is failed
     *
     * @param exception
     * @param jqXHR
     */
    getStandardErrorMessage:function(jqXHR, exception){
        var errorTxt = "Error occurred when sending data to the server: "+ dbPediaLookup.SERVICE_ADDRESS;

        if (jqXHR.status === 0) {
            errorTxt = errorTxt + '<br>Not connected. Verify network.';
        } else if (jqXHR.status == 404) {
            errorTxt = errorTxt + '<br>Request cannot be fulfilled by the server. Check whether the \n(a) DBpedia Lookup Service is available at the above address \n(b) query contains bad syntax.';
        } else if (jqXHR.status == 500) {
            errorTxt = errorTxt + '<br>Internal server error [500].';
        } else if (exception === 'parsererror') {
            errorTxt = errorTxt + '<br>Requested JSON parse failed, possibly due to no results being returned.';
        } else if (exception === 'timeout') {
            errorTxt = errorTxt + '<br>Timeout error.';
        } else if (exception === 'abort') {
            errorTxt = errorTxt + '<br>Ajax request aborted.';
        } else {
            errorTxt = errorTxt + '<br>Uncaught Error.\n' + jqXHR.responseText;
        }

        if (scientificAnnotation.DEBUG) {
            console.error(errorTxt);
        }

        return errorTxt;
    },

    /**
     *
     * @param string
     * @returns {string}
     */
    capitalise : function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
};
