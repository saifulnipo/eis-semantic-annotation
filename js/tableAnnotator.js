/**
 * This js file contains functionality for table annotation.
 *
 * @authors : A Q M Saiful Islam (Nipo)
 * @dependency: none
 */

var tableAnnotator  = {

    ITEM_POSITION_FIRST     : 'first',
    ITEM_POSITION_LAST      : 'last',
    TABLE_ANNOTATION_COUNT  : 1,

    /**
     * Add table annotation as data cube vocabulary
     * @return void
     */
    annotateSelectedTable : function() {

        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            cellCountStruct = tableAnnotator.getTableCellSelectionCountStructure(selectedElements),
            isConfirmSuggestion = false,selectedRows = 0, selectedColumns = 0;

//        tableAnnotator.makeTableSelectionSuggestion(selectedElements);
//        return;


        selectionAnalyser.isUserSelectionIsTableArea(selectedElements);

        if (cellCountStruct === null) {
            messageHandler.showErrorMessage('No pdf table to annotate!! Please open a pdf file',true);
            return;
        }

        if ($.isEmptyObject(cellCountStruct)){
            messageHandler.showErrorMessage('Please select table rows to annotate and try again!!',true);
            return;
        }

        var tableSelectionInfo = tableAnnotator.getProperSelectedTableInfo(selectedElements);
        dataCubeSparql.addAnnotation(tableSelectionInfo); // for the missing selection


//        if (tableAnnotator.isSuggestionPossible(cellCountStruct)) {
//            isConfirmSuggestion =  confirm('Your selection is part of a full rows.\nDid you intend to select the whole row?');
//            if (isConfirmSuggestion) {
//                var selectedTableCellTexts = tableAnnotator.getProperSelectedTableInfo(selectedElements);
//                dataCubeSparql.addAnnotation(selectedTableCellTexts); // for the missing selection
//            } else {
//                tableAnnotator.validateTableSelectionToAddAnnotation(cellCountStruct);
//            }
//        } else {
//            tableAnnotator.validateTableSelectionToAddAnnotation(cellCountStruct);
//        }
    },

    /**
     *
     * @param cellCountStruct
     * @param selectedRows
     * @param selectedColumns
     */
    validateTableSelectionToAddAnnotation : function (cellCountStruct) {
        if (tableAnnotator.isTableSelectionValid(cellCountStruct)) {
            var selectedTableCellTexts = tableAnnotator.getSelectedTableCellTexts(),
                rows = tableAnnotator.getSelectedRowCount(cellCountStruct),
                columns = tableAnnotator.getSelectedColumnCount(cellCountStruct);
            dataCubeSparql.addAnnotation(selectedTableCellTexts);
        } else {
            messageHandler.showErrorMessage('Table selection is not proper!! Please select rows correctly!!',true);

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
                selectedTexts.push(value.textContent.trim());
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
            cellCountStructColumn = cellCountStruct['col'],
            cellCountStructRow = cellCountStruct['row'];

        for(var key in cellCountStructRow) {
            values.push(cellCountStructRow[key]);
        }
        var uniqueArrayCol = $.unique(values);

        values = [];
        for(var key in cellCountStructColumn) {
            values.push(cellCountStructColumn[key]);
        }
        var uniqueArrayRow = $.unique(values);

//        if(uniqueArrayCol.length === 1 && uniqueArrayRow.length === 1){
//            return true;
//        }

        if(uniqueArrayRow.length === 1){
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
            tableStruct['col'] = tableStructX;
            tableStruct['row'] = tableStructY;
        }

        return tableStruct;
    },

    /**
     * Return boolean if the table missing cell selection is possible to suggest
     * @param cellCountStruct
     * @returns {boolean}
     */
    isSuggestionPossible : function(cellCountStruct) {

        var cellCountStructRow = cellCountStruct['col'],
            length = 0 ,sum = 0,values = [],rows = 0;

        for (var key in cellCountStructRow) {
            values.push(cellCountStructRow[key]);
            sum += cellCountStructRow[key];
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
        if (missingItemObj !== null && missingItemObj.item !== null) {
            if(missingItemObj.position === tableAnnotator.ITEM_POSITION_FIRST) {
                selectedTableCellTexts.unshift(missingItemObj.item.text());
            } else {
                selectedTableCellTexts.push(missingItemObj.item.text());
            }
        }
        return selectedTableCellTexts;
    },

    /**
     * Get the max row count
     * @param cellCountStruct
     */
    getSelectedRowCount:function(cellCountStruct) {
        var cellCountStructRow = cellCountStruct['row'],max = 0;
        for (var key in cellCountStructRow) {
            if (cellCountStructRow[key] > max) {
                max = cellCountStructRow[key];
            }
        }
        return max;
    },

    /**
     * Get max column count
     * @param cellCountStruct
     */
    getSelectedColumnCount:function(cellCountStruct){
        var cellCountStructCol = cellCountStruct['col'],max = 0;
        for (var key in cellCountStructCol) {
            if(cellCountStructCol[key] > max){
                max = cellCountStructCol[key];
            }
        }
        return max;
    },

    /**
     *
     * @param selectedElements
     */
    getProperSelectedTableInfo:function (selectedElements) {

        if(selectedElements === undefined) {
            return [];
        }

        var tableStruct = tableAnnotator.getTableColumnStructureForEveryRows(selectedElements),
            columnStartPoints = tableAnnotator.getRefinedColumnStructure(tableStruct),
            selectedTableInfo = tableAnnotator.getSelectedRowsWithColumnValues(tableStruct,columnStartPoints),
            tableRowsAndColumn = [];

        console.log(selectedTableInfo);

        for (var rows in selectedTableInfo) {
            tableRowsAndColumn.push(
                selectedTableInfo[rows]
            );
        }

        return tableRowsAndColumn;
        
//        console.log(tableRowsAndColumn);
    },


    /**
     * Get the all the broken columns structures of every selected rows 
     * @param selectedElements
     * @returns {{}}
     */
    getTableColumnStructureForEveryRows : function (selectedElements) {
        var x , y, tempX, tableStruct = {};
        $.each( selectedElements, function( index, value ) {

            if(tableAnnotator.isDivContainText(value)) {
                x = value.style.top;
                y = value.style.left;

                if(tableStruct[x] === undefined ) {
                    tableStruct[x] = [];
                }
                tableStruct[x].push(
                    {
                        y    : y,
                        cellText : value.textContent
                    }
                );
            }
        });
        
        return tableStruct;
    },


    /**
     * Return the refined news column structure for all the rows
     * @param tableStruct
     * @returns {Array}
     */
    getRefinedColumnStructure : function (tableStruct) {

        var cols = [], columnStartPoints = [], allColumnsIndex = [];
        for(var keys in tableStruct) {
            cols = tableStruct[keys];
            $.each( cols, function( index, value ) {
                var searchedItem = $.grep(allColumnsIndex, function(obj) { return obj.y === value.y; });
                if (!$.isEmptyObject(searchedItem)) {
                    columnStartPoints.push(value.y);
                }
            });
            allColumnsIndex = cols;
        }
        return columnStartPoints;
    },


    /**
     * 
     * @param tableStruct
     * @param columnStartPoints
     * @returns {{}}
     */
    getSelectedRowsWithColumnValues : function (tableStruct, columnStartPoints) {
        var indexCount = 0, currentColumn = 0, nextColumn = 0, 
            tempStr = '',columnValue = '',tempCol = 0,
            selectedRowsAndColumn = {};
        for (var rows in tableStruct) {
            var cols = tableStruct[rows];
            indexCount = 0;
            columnValue = '';
            selectedRowsAndColumn[rows] = [];
            $.each( cols, function( index, column ) {

                tempStr = columnStartPoints[indexCount];
                currentColumn = tableAnnotator.getIntegerValue(tempStr);

                nextColumn = 10000; // assigned a big(unrealistic ) value
                if(columnStartPoints[indexCount+1] !== undefined) {
                    tempStr = columnStartPoints[indexCount+1];
                    nextColumn = tableAnnotator.getIntegerValue(tempStr);
                }

                tempCol = tableAnnotator.getIntegerValue(column.y);
//                console.log(tempCol+','+currentColumn+','+nextColumn+','+column.y+','+indexCount);

                if (tempCol >= currentColumn && tempCol < nextColumn) {
                    columnValue += column.cellText;
                } else {
//                    console.log(columnValue);
                    selectedRowsAndColumn[rows].push(columnValue);
                    columnValue = '';
                    columnValue +=column.cellText;
                    indexCount++;
                }
            });
//            console.log(columnValue);
            selectedRowsAndColumn[rows].push(columnValue);
        }
        return selectedRowsAndColumn;
    },

    /**
     * Get the integer value of a pixel representation
     * i.e 165.12px = 165
     * @param str
     * @returns {*}
     */
    getIntegerValue : function(str) {

        if (str === undefined || str.trim() === ''){
            return -1;
        }

        return parseInt(str.substr(0, str.length-2));
    },

    /**
     *
     * @param selectedElements
     */
    makeTableSelectionSuggestion : function (selectedElement) {

        if ($.isEmptyObject(selectedElement)){
            return null;
        }

        var firstElement = $(selectedElement[0]),
            lastElement = $(selectedElement[selectedElement.length -1]),
            itemBeforeFirst = $(firstElement.prev()),
            itemAfterLast = $(lastElement.next()),
            missingSelectedItem = null,
            position = null;


        var canvas = firstElement.get(0);

        console.log(canvas);

        return;


//        for (var i = 0; i < 3; i++) {

            var count = 0;

            while (firstElement !== undefined && itemBeforeFirst !== undefined
                && firstElement.css('top') === itemBeforeFirst.css('top')) {

                console.log(itemBeforeFirst.css('left') + '::' + itemBeforeFirst.text());
                itemBeforeFirst = $(itemBeforeFirst.prev());
//                break;
                count++;
            }

            while (lastElement !== undefined && itemAfterLast !== undefined
                && lastElement.css('top') === itemAfterLast.css('top')) {

                console.log(itemAfterLast.css('left') + '::' + itemAfterLast.text());
                itemAfterLast = $(itemAfterLast.next());
                count++;
            }

            firstElement = itemBeforeFirst;
            lastElement = itemAfterLast;

//        if(itemBeforeFirst.css('top') === firstElement.css('top')) {
//            missingSelectedItem = itemBeforeFirst;
//            position = tableAnnotator.ITEM_POSITION_FIRST;
//        }
//
//        if(lastElement.css('top') === itemAfterLast.css('top')) {
//            missingSelectedItem = itemAfterLast;
//            position = tableAnnotator.ITEM_POSITION_LAST;
//        }
//
//        return {
//            item  : missingSelectedItem,
//            position : position
//        }

    }

};
