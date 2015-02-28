# Semantic Table Annotation Tool for EIS related PDF documents

It is a web-based semantic annotation tool for annotating table information in a pdf documents <br>
Using this tool one can annotate a table text in the form of tripple.<br> 
This tool transform selected table information in to the [RDF Data Cube Vocabulary](http://www.w3.org/TR/vocab-data-cube/).


## Project Current state
Following are the working features and ongoing works details.<br>

### Currently working features:
- [Table auto annotation](http://youtu.be/i4oXo01cpVY)
- [Table manual annotation](http://youtu.be/DuHdWuUFeFo)
- [Export as CSV](https://www.youtube.com/watch?v=PwyjeJ1zSRA)
- [Add annotation](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-add-annotations)
- [View available annotation of currently loaded documents](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-fetch-existing-annotations)
- [Find similar publications](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#find-similar-publications)
- [Table Annotation](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-annotate-table)

## Related Work in progress:

There is another project  done as a masters thesis, 
 - https://github.com/jaanatak/eis-semantic-annotation concentrates on the further development of the [find similar publications](https://github.com/AKSW/semann/wiki/Documentation#find-similar-publications) functionality. 
Eventually the two parallel forks will be merged into here.

## Documentation
- [Complete Documentation](https://github.com/saifulnipo/eis-semantic-annotation/wiki)

## Javascript Static code analyser
- [JsLint](http://www.jslint.com/)
- [JsHint](http://www.jshint.com/)

## Used libraries

[PDF.js](http://mozilla.github.io/pdf.js/) - Viewer Example is used as a base for the project  
[Twitter bootstrap](http://getbootstrap.com/) - used for UI  
[jQuery](http://jquery.com/) - used for DOM manipulations, required by Twitter bootstrap  
[Typeahead.js](https://github.com/twitter/typeahead.js) - used for autosuggestion in input boxes  
[Ranjy](https://code.google.com/p/rangy/) - A cross-browser JavaScript range and selection library.  
[Qunit](http://qunitjs.com/) - JavaScript unit testing framework

## Backend Database Used
- [virtuoso](http://virtuoso.openlinksw.com/)
