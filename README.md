# Semantic Annotation Tool for EIS related PDF documents

It is a web-based semantic annotation tool for pdf documents, focusing on EIS related documents.<br>
Using this tools one can annotate any text in the form of tripple.<br>
Storing annotations is available in the format of json, as pseudo-triples ( {s: {p: [o1, o2]}} )

## Project Current state
Following are the working features and ongoing works details.<br>
For EIS table annotation, the project is in very early stage.

### Currently working features:
- Load and render a PDF file within half-page and render other half with custom GUI.
- Detect selected text on the page using window.getSelection() method and add a new annotation for snippet.
- [Add annotation] (https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-add-annotations)
- [View available annotation of currently loaded documents](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#how-to-fetch-existing-annotations)
- [Find similar publications](https://github.com/saifulnipo/eis-semantic-annotation/wiki/Documentation#find-similar-publications)

### Work on progress:
- Focusing on annotate table annotation. Which will be mainly EIS related  documents. [Issue](https://github.com/saifulnipo/eis-semantic-annotation/issues/3)
- Adding rows and column info via data cube structure. [Issue](https://github.com/saifulnipo/eis-semantic-annotation/issues/2)

## Documentation
- [Complete Documentation](https://github.com/saifulnipo/eis-semantic-annotation/wiki)

## Javascript Static code analyser
- [JsLint](http://www.jslint.com/)
- [jsHint](http://www.jshint.com/)

## Used libraries

[PDF.js](http://mozilla.github.io/pdf.js/) - Viewer Example is used as a base for the project  
[Twitter bootstrap](http://getbootstrap.com/) - used for UI  
[jQuery](http://jquery.com/) - used for DOM manipulations, required by Twitter bootstrap  
[Typeahead.js](https://github.com/twitter/typeahead.js) - used for autosuggestion in input boxes  
[Ranjy](https://code.google.com/p/rangy/) - A cross-browser JavaScript range and selection library.

## Backend Database Used
- [virtuoso](http://virtuoso.openlinksw.com/)