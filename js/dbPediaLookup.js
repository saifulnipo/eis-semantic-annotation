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

var dbPediaLookup  = {

    SERVICE_ADDRESS : "http://lookup.dbpedia.org/api/search/",
    REQUEST_TYPE_AUTO_SEARCH : "PrefixSearch",
    REQUEST_TYPE_QUERY_CLASS : "KeywordSearch",
    PARAM_STRING: "QueryString",
    PARAM_CLASS: "QueryClass",
    PARAM_MAXHITS: "MaxHits",
    MAX_HITS_COUNT: 5,
    dbResponse: null,
    dbSubjectResponse: null,
    dbObjectResponse: null,

    lookUpResult : {},

    /**
     * prepare an ajax call for contacting DBpedia Lookup service. This allows us to transform literals into classes.
     *
     * @param {String} keyword to be passed on as a parameter to the service
     *
     * @return {object}
     */

    getResources: function(keyword, queryClass) {

        if (keyword === null || keyword === '') {
            return dbPediaLookup.parseResponse(null);
        }

        var lookupResponseOutput = null;

        var queryParameters = dbPediaLookup.queryParametersForAutoSearch(keyword);
        if(queryClass) {
            queryParameters = dbPediaLookup.queryParametersForQueryClass(keyword, queryClass);
        }

        var settings = {
            type: "GET",
            url: dbPediaLookup.SERVICE_ADDRESS+queryParameters,
            async: false,
            dataType: "json",
            cache: false,
            beforeSend: function(xhr) {
                xhr.withCredentials = true;
            }
        }
        $.ajax(settings)
            .fail(function(jqXHR, exception) { //what to do in case of error
                var errorTxt= dbPediaLookup.getStandardErrorMessage(jqXHR ,exception);
                messageHandler.showErrorMessage(errorTxt);
                progress.hideProgressBar();
                lookupResponseOutput = dbPediaLookup.parseResponse(null);

            })
            .success(function(response) {
                lookupResponseOutput = dbPediaLookup.parseResponse(response);
            });

        return lookupResponseOutput;
    },

    /**
     * Return the URL parameters to be used in auto search querying.
     *
     * @param {string} searchKey search key
     *
     * @returns {string} query parameter
     */
    queryParametersForAutoSearch :function (searchKey) {
        var parameters = dbPediaLookup.REQUEST_TYPE_AUTO_SEARCH + '?' + dbPediaLookup.PARAM_MAXHITS + '=' + dbPediaLookup.MAX_HITS_COUNT + '&' + dbPediaLookup.PARAM_STRING + "=" + encodeURIComponent(searchKey);
        return parameters;
    },

    /**
     * Return the URL parameters to be used in class search querying.
     *
     * @param {string} searchKey search key
     * @param {string} className class name where to search
     *
     * @returns {string} query parameter
     */
    queryParametersForQueryClass :function (searchKey, className) {
        var parameters = dbPediaLookup.REQUEST_TYPE_QUERY_CLASS + '?' + dbPediaLookup.PARAM_CLASS + '=' + className + '&' + dbPediaLookup.PARAM_STRING + "=" + encodeURIComponent(searchKey);
        return parameters;
    },

    /**
     * Parse the response the return the URIs with their label
     *
     * @param {JSON} response object.
     *
     * @return String containing formatted DBpedia response,
     */
    parseResponse : function(response){

        var uris = [], uriLabels = [],uriContents = null ;

        if (response === null || response.results.length === 0) {

            return {
                URIs:       uris,
                labels:     uriLabels
            }
        }

        if (response.results.length > 0) {

            $.each(response.results, function(i, item) {
                uris.push(item.uri);
                uriLabels.push(item.label);
            });

            return {
                URIs:       uris,
                labels:     uriLabels
            }
        }
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
    }
};
