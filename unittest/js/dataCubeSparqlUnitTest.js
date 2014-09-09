var dataCubeSparqlUnitTest = {

    dataCubeSparqlGetDocumentURITest: function() {
        return  ("http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20Test#page=undefined?name=table1" == dataCubeSparql.getDocumentURI());
    },


	dataCubeSparqlgetDataStructureDefinition: function() {
		return ("ex:dsdTable1 a qb:DataStructureDefinition ;\nqb:component [ qb:dimension ex:table1Row ; qb:order 1 ];\nqb:component [ qb:dimension ex:table1Column ;qb:order 2 ];\nqb:component [ qb:measure semann:value ] ." == dataCubeSparql.getDataStructureDefinition());
	},

	dataCubeSparqlGetDataSet: function() {
		return ("ex:table1 a qb:DataSet ;\ndct:isPartOf <http://eis.iai.uni-bonn.de/semann/pdf/EIS%20Semantic%20Web%20Annotation%20::%20Unit%20Test#page=undefined?name=table1> ;\nqb:structure ex:dsdTable1 ;\nqb:slice ex:sliceC1,ex:sliceC2,ex:sliceC3,ex:sliceC4,ex:sliceC5,ex:sliceC6,ex:sliceC7,ex:sliceC8,ex:sliceC9,ex:sliceC10 ." == dataCubeSparql.getDataSet(10));

	}



};



 

