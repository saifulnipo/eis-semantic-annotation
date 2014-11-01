/**
 This file prepare the UI for  dbpedia lookup, so that user can select ontology classed

 @authors :AQM Saiful Islam
 @dependency
 {
    scientificAnnotation.js
 }
 */

var dbPediaLookupUIOptions  = {

    /**
     * Ontology look up classes
     */
    ontologyClasses : [ '--none--', 'auto', 'Place', 'Person', 'Work', 'Species', 'Organisation'],

    /**
     * Show the ontology class for each column
     * @param {array} columnNames
     */
    showOntologyListOptions : function (columnNames) {

        var ontologyDisplayOptionContainer = $('#ontologyClassSelectionContainer'),
            ontologyDisplayOptionPanel = $('#ontologyClassSelectionPanel');

        ontologyDisplayOptionContainer.show();

        ontologyDisplayOptionPanel.empty();
        ontologyDisplayOptionPanel.show();

        var columnValue = '',i = 0;
        for (i = 0; i < columnNames.length; i++) {
            columnValue += "<tr class = 'showResult'>";
            columnValue += "<td class = 'showResult'>" + columnNames[i] + "</td>";
            columnValue += "<td class = 'showResult'>" + dbPediaLookupUIOptions.getListOptions('ontologyList' + i) + "</td>";
            columnValue += "</tr>";
        }

        ontologyDisplayOptionPanel.append(
            "<table class = 'showResult' width='auto'>" + columnValue + "</table>"
        );
    },

    /**
     * Get the html for a list
     * @param {string} id html id
     * @returns {string}
     */
    getListOptions : function(id) {

        var html = '<select>\n';
        $.each(dbPediaLookupUIOptions.ontologyClasses, function(index, value) {
            html += '<option id="' + id + '" value="' + value + '" >' + value + '</option>\n';
        });
        html += '</select>';
        return html;
    }
};
