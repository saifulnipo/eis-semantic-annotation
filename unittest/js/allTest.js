
/**
* Created by nipo on 7/8/14.
* */

/*global QUnit:false, sparqlUnitTest:false, sparqlResponseParserUnitTest :false */

QUnit.module( "Sparql Unit Test for our EIS Lab" );
QUnit.test( "Sparql Server Url Validity", function( assert ) {
    var serverUrl = "http://localhost:8890/sparql";
    assert.ok( true === sparqlUnitTest.testIsSparqlServerUrlValid(serverUrl), "Sparql End point URL is valid!" );
});
QUnit.test( " Camel Case test ", function( assert ) {
    assert.ok( true === sparqlUnitTest.convertCamelCaseSuccessTest(), " Camel case test success!" );
    assert.ok( false === sparqlUnitTest.convertCamelCaseFailTest(), " Camel case test fail!" );

});



//QUnit.module( "Sparql Response Parser Unit Test" );
//QUnit.test( "Response Parser", function( assert ) {
//    assert.ok( true === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing success!" );
//    assert.ok( false === sparqlResponseParserUnitTest.testIsParsePropertySuccess(), "Parsing failed!" );
//});



QUnit.module( "Progressbar Test Unit Test" );            
QUnit.test( " progressbar test ", function( assert ) {
    assert.ok( true === progressbarUnitTest.ShowProgressbarUnitTest(), " Progress Bar test success!" );
});



QUnit.module( "dataCubeSparql Unit Test" ); 
QUnit.test( "data cube sparql getDocumentURI test", function( assert ) {
    assert.ok( true == dataCubeSparqlUnitTest.dataCubeSparqlGetDocumentURITest(), " Get document URI test is success!" );
});


QUnit.test( "data cube sparql getDataStructureDefinition test", function( assert ) {
    assert.ok( true == dataCubeSparqlUnitTest.dataCubeSparqlgetDataStructureDefinition(), "Data Structure Definition test is success!" );
});
 
QUnit.test( "dataCubeSparql GetDataSet Test", function( assert ) {
    assert.ok( true == dataCubeSparqlUnitTest.dataCubeSparqlGetDataSet(10), "Data Set test is success!" );
});
console.log(dataCubeSparql.getDataSet(10));

 
