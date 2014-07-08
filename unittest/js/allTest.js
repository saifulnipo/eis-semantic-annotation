
/**
* Created by nipo on 7/8/14.
* */

/*global QUnit:false, sparqlUnitTest:false, sparqlResponseParserUnitTest :false */

QUnit.module( "Sparql Unit Test" );
QUnit.test( "Sparql Server Url Validity", function( assert ) {
    var serverUrl = "http://localhost:8890/sparql";
    assert.ok( true === sparqlUnitTest.testIsSparqlServerUrlValid(serverUrl), "Sparql End point URL is valid!" );
});

QUnit.module( "Sparql Response Parser Unit Test" );
QUnit.test( "Response Parser", function( assert ) {
    assert.ok( true === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing success!" );
    assert.ok( false === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing failed!" );
});

