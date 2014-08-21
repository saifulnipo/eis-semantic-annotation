/**
 * This js file contains functionality for table annotation.
 *
 * @authors : A Q M Saiful Islam (Nipo)
 * @dependency: none
 */

var tableAnnotator  = {

    ITEM_POSITION_FIRST : 'first',
    ITEM_POSITION_LAST : 'last',

    /**
     * Add table annotation as data cube vocabulary
     * @return void
     */
    annotateSelectedTable : function() {

        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            cellCountStruct = tableAnnotator.getTableCellSelectionCountStructure(selectedElements),
            isConfirmSuggestion = false;

        if (cellCountStruct === null){
            scientificAnnotation.showErrorMessage('No pdf table to annotate!! Please open a pdf file',true);
            return;
        }

        if ($.isEmptyObject(cellCountStruct)){
            scientificAnnotation.showErrorMessage('Please select table rows to annotate and try again!!',true);
            return;
        }

        if (tableAnnotator.isSuggestionPossible(cellCountStruct)) {
            isConfirmSuggestion =  confirm('Your selection is part of a full rows.\nDid you intend to select the whole row?');
            if (isConfirmSuggestion) {
                var selectedTableCellTexts = tableAnnotator.getSelectedTextWithSuggestedItem(selectedElements);
                dataCubeSparql.addAnnotation(selectedTableCellTexts);
            } else {
                tableAnnotator.validateTableSelectionToAddAnnotation(cellCountStruct);
            }
        } else {
            tableAnnotator.validateTableSelectionToAddAnnotation(cellCountStruct);
        }
    },

    /**
     *
     * @param cellCountStruct
     */
    validateTableSelectionToAddAnnotation : function (cellCountStruct) {
        if (tableAnnotator.isTableSelectionValid(cellCountStruct)) {
            var selectedTableCellTexts = tableAnnotator.getSelectedTableCellTexts();
            dataCubeSparql.addAnnotation(selectedTableCellTexts);
        } else {
            scientificAnnotation.showErrorMessage('Table selection is not proper!! Please select rows correctly!!',true);

        }
    },

    /**
     * Return the selected text of the table cell
     * @returns {Array}
     */
    getSelectedTableCellTexts : function(){

        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            selectedTexts = [] ;
        $.each( selectedElements, function( index, value ) {
            if(tableAnnotator.isDivContainText(value)) {
                selectedTexts.push(value.textContent);
            }
        });
        return selectedTexts;
    },

    /**
     * Return intersected Nodes
     * @param range
     * @param node
     * @returns {*}
     */
    rangeIntersectsNode:function(range, node) {
        var nodeRange;
        if (range.intersectsNode) {
            return range.intersectsNode(node);
        } else {
            nodeRange = node.ownerDocument.createRange();
            try {
                nodeRange.selectNode(node);
            } catch (e) {
                nodeRange.selectNodeContents(node);
            }

            return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
                range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
        }
    },

    /**
     * Return all the selected element inside a table
     * @param win
     * @returns {*}
     */
    getSelectedElementTags:function(win) {
        var range, sel, selectedElements, treeWalker, containerElement;
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0);
        }

        if (range) {
            containerElement = range.commonAncestorContainer;
            if (containerElement.nodeType != 1) {
                containerElement = containerElement.parentNode;
            }

            treeWalker = win.document.createTreeWalker(
                containerElement,
                NodeFilter.SHOW_ELEMENT,
                function(node) {
                    return tableAnnotator.rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                },
                false
            );

            selectedElements = [treeWalker.currentNode];
            while (treeWalker.nextNode()) {
                selectedElements.push(treeWalker.currentNode);
            }
        }
        return selectedElements;
    },

    /**
     * Check if the selected div contain the text items
     * @param div
     * @returns {boolean}
     */
    isDivContainText : function(div) {
        return div.hasAttribute('data-canvas-width');
    },


    /**
     * Return true if a table is selected property. i.e proper equal row selection
     * @returns {boolean}
     */
    isTableSelectionValid : function(cellCountStruct) {
        var values = [],
            cellCountStructX = cellCountStruct['X'],
            cellCountStructY = cellCountStruct['Y'];

        for(var key in cellCountStructX) {
            values.push(cellCountStructX[key]);
        }
        var uniqueArrayX = $.unique(values);

        values = [];
        for(var key in cellCountStructY) {
            values.push(cellCountStructY[key]);
        }
        var uniqueArrayY = $.unique(values);

        if(uniqueArrayX.length === 1 && uniqueArrayY.length === 1){
            return true;
        }

        return false;
    },

    /**
     * Return the selected table cell count data structure
     * @param selectedElements
     * @returns {Array} associative array
     */
    getTableCellSelectionCountStructure : function(selectedElements) {

        if(selectedElements === undefined) {
          return null;
        }
        var x , y,  tableStructX = [],tableStructY = [],tableStruct = {};
        $.each( selectedElements, function( index, value ) {
            if(tableAnnotator.isDivContainText(value)) {
                x = value.style.top;
                y = value.style.left;


                if (x !== undefined && x !== '') {
                    if (tableStructX[x] !== undefined) {
                        tableStructX[x]++;
                    }else{
                        tableStructX[x] = 1;
                    }
                }

                if (y !== undefined && y !== '') {
                    if (tableStructY[y] !== undefined) {
                        tableStructY[y]++;
                    }else{
                        tableStructY[y] = 1;
                    }
                }
            }
        });


        if (!$.isEmptyObject(tableStructX) && !$.isEmptyObject(tableStructX)) {
            tableStruct['X'] = tableStructX;
            tableStruct['Y'] = tableStructY;
        }

        return tableStruct;
    },

    /**
     * Return boolean if the table missing cell selection is possible to suggest
     * @param cellCountStruct
     * @returns {boolean}
     */
    isSuggestionPossible : function(cellCountStruct) {

        var cellCountStructX = cellCountStruct['X'],
            length = 0 ,sum = 0,values = [],rows = 0;

        for (var key in cellCountStructX) {
            values.push(cellCountStructX[key]);
            sum += cellCountStructX[key];
            length++;
        }

        var maxValue = Math.max.apply(Math, values),
            expectedSelectedCells =  maxValue * length,
            actualSelectedCells = sum;

        if ((expectedSelectedCells - actualSelectedCells) === 1) {
            return true;
        }

        return false;

    },

    /**
     * Get the missing selected item
     * @param selectedElement
     * @returns {mix}
     */
    getMissingSelectionElement: function(selectedElement) {

        if (selectedElement.length < 1){
            return null;
        }

        var firstElement = $(selectedElement[1]),
            lastElement = $(selectedElement[selectedElement.length -1]),
            itemBeforeFirst = $(firstElement.prev()),
            itemAfterLast = $(lastElement.next()),
            missingSelectedItem = null,position = null;

        if(itemBeforeFirst.css('top') === firstElement.css('top')) {
            missingSelectedItem = itemBeforeFirst;
            position = tableAnnotator.ITEM_POSITION_FIRST;
        }

        if(lastElement.css('top') === itemAfterLast.css('top')) {
            missingSelectedItem = itemAfterLast;
            position = tableAnnotator.ITEM_POSITION_LAST;
        }

        return {
            item  : missingSelectedItem,
            position : position
        }
    },


    /**
     * Return the new selected text after applying the suggested elements
     * @param selectedElements
     * @returns {Array}
     */
    getSelectedTextWithSuggestedItem: function (selectedElements) {
        var selectedTableCellTexts = tableAnnotator.getSelectedTableCellTexts(),
            missingItemObj = tableAnnotator.getMissingSelectionElement(selectedElements);
        if (missingItemObj !== null) {
            if(missingItemObj.position === tableAnnotator.ITEM_POSITION_FIRST) {
                selectedTableCellTexts.unshift(missingItemObj.item.text());
            } else {
                selectedTableCellTexts.push(missingItemObj.item.text());
            }
        }
        return selectedTableCellTexts;
    }
};
