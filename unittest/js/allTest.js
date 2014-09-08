
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


//QUnit.module( "Progress Bar Unit Test" );
//QUnit.test( " Progress Bar  ", function( assert ) {
//    assert.ok( true === progress.progressbar(), "test success!" );
//    assert.ok( false === progress.progressbar(), "test failed!" );
//
//});
//
//QUnit.module( "Progress Bar Unit Test" );
//QUnit.test( " Hide Progress Bar  ", function( assert ) {
//    assert.ok( true === progress.progressbar(), "hided successfully!" );
//    assert.ok( false === progress.progressbar(), "Hiding failed!" );
//
//});

QUnit.module( "test param" );
QUnit.test( "get param ", function( assert ) {
    var actual = "Hello World";
    var expected = "HelloWorld";
    
    var url = "http://example.com?a=1&b=2";

    assert.ok( null != test.getParam(url, "a"), "not null check" );
    assert.ok( 1 == test.getParam(url, "a"), "param " );
    // assert.ok( expected === test.testSmth(actual), "test success!" );
    // assert.ok( true === test.similarFilesResposeIsNotNull(), "similar files Response is not null!" );
     // assert.ok( true === test.numberOfSimilarFilesLimit(), "Number of similar files less than ...!" );
});

QUnit.module( "sparql" );
QUnit.test( "sparql resource method test", function( assert ) {
    var actual = "Hello World";
    var expected = "HelloWorld";
    var array = {
            File:			"<http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20Test>",
            hasExcerpt:	"<http://eis.iai.uni-bonn.de/semann/publication/hasExcerpt>", label: "<http://www.w3.org/2000/rdf-schema#label>",
            label:			"<http://www.w3.org/2000/rdf-schema#label>",
            Publication:		"<http://eis.iai.uni-bonn.de/semann/publication/Publication>",
            Excerpt:		"<http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20TestHello World>"
        }

    assert.ok( array.File == sparql.resource(actual).File, "Accepted test" );
    assert.ok( array.hasExcerpt == sparql.resource(actual).hasExcerpt, "Accepted test" );
    assert.ok( array.label == sparql.resource(actual).label, "Accepted test" );
    assert.ok( array.Publication == sparql.resource(actual).Publication, "Accepted test" );
    assert.ok( array.Excerpt == sparql.resource(actual).Excerpt, "Accepted test" );
});
QUnit.test( "sparql camelcase test", function( assert ) {
    assert.ok( "helloWorld" == sparql.camelCase("HelloWorld"), "Accepted test" );
    assert.ok( "kopiruyEtuStrokuIPishiSudaLyuboyCamelCase" == sparql.camelCase("KopiruyEtuStrokuIPishiSudaLyuboyCamelCase"), "Accepted test" );
});
QUnit.test( "data cube sparql getDocumentURI test", function( assert ) {
    assert.ok( "http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20Test#page=undefined?name=table1" == dataCubeSparql.getDocumentURI(), "Accepted test" );
});
QUnit.test( "data cube sparql getDataStructureDefinition test", function( assert ) {
    assert.ok( "ex:dsdTable1 a qb:DataStructureDefinition ;\nqb:component [ qb:dimension ex:table1Row ; qb:order 1 ];\nqb:component [ qb:dimension ex:table1Column ;qb:order 2 ];\nqb:component [ qb:measure semann:value ] ." == dataCubeSparql.getDataStructureDefinition(), "Accepted test" );
});
QUnit.test( "data cube sparql getDataSet test", function( assert ) {
    assert.ok( "ex:table1 a qb:DataSet ;\ndct:isPartOf <http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20Test#page=undefined?name=table1> ;\nqb:structure ex:dsdTable1 ;\nqb:slice ex:sliceC1,ex:sliceC2,ex:sliceC3,ex:sliceC4,ex:sliceC5,ex:sliceC6,ex:sliceC7,ex:sliceC8,ex:sliceC9,ex:sliceC10 ." == dataCubeSparql.getDataSet(10), "Accepted test" );
});
console.log(dataCubeSparql.getDataSet(10));