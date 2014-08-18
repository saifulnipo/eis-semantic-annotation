/**
 * This js file contains functionality for table annotation.
 *
 * @authors : A Q M Saiful Islam
 * @dependency: none
 */

var tableAnnotator  = {

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
    isTableSelectionValid : function() {
        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            cellCountStruct = tableAnnotator.getTableCellSelectionCountStructure(selectedElements),
            values = [],
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
        tableStruct['X'] = tableStructX;
        tableStruct['Y'] = tableStructY;
        return tableStruct;
    }
};
