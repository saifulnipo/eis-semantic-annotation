
/**
* Created by nipo on 7/8/14.
* */

/*global QUnit:false, sparqlUnitTest:false, sparqlResponseParserUnitTest :false */

QUnit.module( "Sparql Unit Test for our EIS" );
QUnit.test( "Sparql Server Url Validity", function( assert ) {
    var serverUrl = "http://localhost:8890/sparql";
    assert.ok( true === sparqlUnitTest.testIsSparqlServerUrlValid(serverUrl), "Sparql End point URL is valid!" );
});

QUnit.module( "Sparql Response Parser Unit Test" );
QUnit.test( "Response Parser", function( assert ) {
    assert.ok( true === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing success!" );
    assert.ok( false === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing failed!" );
});

QUnit.module( "Camel Case Unit Test" );
QUnit.test( " Minimize letters ", function( assert ) {
    var actual = "Hello World";
    var expected = "helloWorld";
    assert.ok( true === test.testSmth(actual, expected), "test success!" );
    assert.ok( true === test.similarFilesResposeIsNotNull(), "similar files Response is not null!" );
    assert.ok( true === test.numberOfSimilarFilesLimit(), "Number of similar files less than ...!" );
});

QUnit.module( "Progress Bar Unit Test" );
QUnit.test( " Progress Bar  ", function( assert ) {
    assert.ok( true === progress.progressbar(), "test success!" );
    assert.ok( false === progress.progressbar(), "test failed!" );
    
});

QUnit.module( "Progress Bar Unit Test" );
QUnit.test( " Hide Progress Bar  ", function( assert ) {
    assert.ok( true === progress.progressbar(), "hided successfully!" );
    assert.ok( false === progress.progressbar(), "Hiding failed!" );
    
});



