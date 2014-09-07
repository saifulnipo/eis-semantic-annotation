var test = {

    testSmth:function(str) {
        return sparql.camelCase(str);
    },

    similarFilesResposeIsNotNull:function() {
        return (sparql.findSimilarFiles() != null);
    },

     numberOfSimilarFilesLimit:function() {
        var items = [];
        items = sparql.findSimilarFiles();
        return (items != null && items.length < 10)
    },

    getParam:function(url, param) {
      var items = sparqlResponseParser.getURLParameters(url, param)
      return items;
    }
};