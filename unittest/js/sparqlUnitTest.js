/**
 * This file contain the unit test of libs/sparql.js file
 *
 * @authors : A Q M Saiful Islam
 * @dependency:
 * {
 *   sparql.js
 *   highlight.js
 * }
 *
 */
/*global QUnit:false, sparql :false */

var sparqlUnitTest = {

    testIsSparqlServerUrlValid : function(serverUrl) {
        return (sparql.SERVER_ADDRESS === serverUrl);
    },




};