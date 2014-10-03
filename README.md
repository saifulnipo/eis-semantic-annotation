# Semantic Table Annotation Tool for EIS related PDF documents

It is a web-based semantic annotation tool for annotating table information in a pdf documents, focusing on EIS related documents.<br>
Using this tool one can annotate a table text in the form of tripple.<br> 
This tool transform selected table information in to the [RDF Data Cube Vocabulary](http://www.w3.org/TR/vocab-data-cube/).


## Project Current state
Following are the working features and ongoing works details.<br>
For EIS table annotation, the project is still under develepment but can perform the basic annotation process.

### Currently working features:
- Load and render a PDF file within half-page and render other half with custom GUI.
- Detect selected text on the page using window.getSelection() method and add a new annotation for snippet.
- [Add annotation](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-add-annotations)
- [View available annotation of currently loaded documents](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-fetch-existing-annotations)
- [Find similar publications](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#find-similar-publications)
- [Table Annotation](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-annotate-table)

## Work in progress:
This project is concentrates on annotating tables in PDF
 - https://github.com/saifulnipo/eis-semantic-annotation

There is another project  under developement, 
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
