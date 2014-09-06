var test = {

    testSmth:function(actual, expected) {
        return (sparql.camelCase(actual) === expected);
    },

    similarFilesResposeIsNotNull:function() {
        return (sparql.findSimilarFiles() != null);
    },

     numberOfSimilarFilesLimit:function() {
        var items = [];
        items = sparql.findSimilarFiles();
        return (items != null && items.length < 10)
    }
};