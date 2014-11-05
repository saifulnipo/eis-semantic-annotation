/**
 * This js file contains functionality for table annotation.
 *
 @authors : A Q M Saiful Islam (Nipo)
 @dependency:
 {
  dataCubeSparql.js
  messageHandler.sj
 }
 */

/*global $:false, scientificAnnotation :false, confirm: false,
 progressbar : false, sparql:false, messageHandler:false, plusplus: false  */

/*jslint plusplus: true */

var tableAnnotator  = {

    ITEM_POSITION_FIRST     : 'first',
    ITEM_POSITION_LAST      : 'last',
    TABLE_ANNOTATION_COUNT  : 1,
    INF                     : 100000,
    TABLE_SELECTION_ABORT   : 2000,
    INVALID                 : -1,
    storedData              : null,

    /**
     * Get the selected info from the pdf and generate the data cube vocabulary
     * and finally add it to the backend
     *
     * @return void
     */
    annotateSelectedTable : function () {

        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            isConfirmSuggestion = false,
            validatedTableInfo = null;

        messageHandler.clearMessage();

        if ($.isEmptyObject(selectedElements)) {
            messageHandler.showErrorMessage('Please open pdf file and select a table to annotate and try again!!', true);
            return;
        }


        validatedTableInfo = tableAnnotator.getValidatedTableSelectedInfo(selectedElements);

        if (validatedTableInfo.isGetTableRangeSuccess === false) {
            messageHandler.showErrorMessage('Table selection does not seems proper. ' +
                '<br> Please select atleast first 3 rows includeing column names ' +
                '<br> and try again!!');
            return;
        }

        if (validatedTableInfo.isSelectionSuggestionPossible === true) {

            isConfirmSuggestion =  confirm('Your selection is part of a full table.\nDid you intend to select the whole table?');
            if (isConfirmSuggestion) {
                tableAnnotator.displayInfoIntoTable(validatedTableInfo.selectedElements);
            }
        } else {
            tableAnnotator.displayInfoIntoTable(validatedTableInfo.selectedElements);
        }
    },

    /**
     * Display the user selected pdf info in to html view
     *
     * @param {Array} selectedElements
     * @return {void}
     */
    displayInfoIntoTable : function (selectedElements) {
        var tableInfo = tableAnnotator.getSelectedTableInfo(selectedElements);
        tableAnnotator.storedData = tableInfo;
        if ($.isEmptyObject(selectedElements)) {
            messageHandler.showErrorMessage('No selected data found to display', true);
            return;
        }
        tableAnnotator.generateHtmlTableForSelectedInfo(tableInfo);
        dbPediaLookupUIOptions.showOntologyListOptions(tableInfo[0]);
    },

    /**
     * Return intersected item as Nodes
     *
     * @param range
     * @param node
     * @returns {*}
     */
    rangeIntersectsNode: function (range, node) {
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

            return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) === tableAnnotator.INVALID &&
                range.compareBoundaryPoints(Range.START_TO_END, nodeRange) === 1;
        }
    },

    /**
     * Return all the selected element of the table which contain only text
     *
     * @param {window} win
     * @returns {Array}
     */
    getSelectedElementTags: function (win) {
        var range, sel, selectedElements = [], treeWalker, containerElement;
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0);
        }

        if (range) {
            containerElement = range.commonAncestorContainer;
            if (containerElement.nodeType !== 1) {
                containerElement = containerElement.parentNode;
            }

            treeWalker = win.document.createTreeWalker(
                containerElement,
                NodeFilter.SHOW_ELEMENT,
                function (node) {
                    return tableAnnotator.rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                },
                false
            );

            if (tableAnnotator.isDivContainText(treeWalker.currentNode)) {
                selectedElements.push(treeWalker.currentNode);
            }

            while (treeWalker.nextNode()) {
                if (tableAnnotator.isDivContainText(treeWalker.currentNode)) {
                    selectedElements.push(treeWalker.currentNode);
                }
            }
        }
        return selectedElements;
    },

    /**
     * Check if the selected div contain the text items
     *
     * @param {HTMLElement} div
     * @returns {boolean}
     */
    isDivContainText : function (div) {

        if (div === undefined || div === null) {
            return false;
        }

        return div.hasAttribute('data-font-name');
    },

    /**
     * Get refined table information from the initial selected elements which may contain all many broken elements
     *
     * @param {Array} selectedElements
     * @returns {Array}
     */
    getSelectedTableInfo: function (selectedElements) {

        if (selectedElements === undefined) {
            return [];
        }

        var tableStruct = tableAnnotator.getTableColumnStructureForEveryRows(selectedElements),
            columnStartPoints = tableAnnotator.getRefinedColumnStructure(tableStruct),
            selectedTableInfo = tableAnnotator.getSelectedRowsWithColumnValues(tableStruct, columnStartPoints),
            tableRowsAndColumn = [], rows = '';

        for (rows in selectedTableInfo) {
            tableRowsAndColumn.push(
                selectedTableInfo[rows]
            );

//            console.log(selectedTableInfo[rows]);
        }

        return tableRowsAndColumn;
    },


    /**
     * Get the all the broken columns structures of every selected rows
     *
     * @param {Array} selectedElements
     * @returns {Array}
     */
    getTableColumnStructureForEveryRows : function (selectedElements) {
        var x, y, tableStruct = {}, lastInsertedKey = null;
        $.each(selectedElements, function (index, value) {

            x = value.style.top;
            y = value.style.left;

            if (tableStruct[x] === undefined) {
                lastInsertedKey = tableAnnotator.getLastInsertedKey(tableStruct);

                var currentX = tableAnnotator.getIntegerValue(x),
                    lastX = tableAnnotator.getIntegerValue(lastInsertedKey),
                    currentY = tableAnnotator.getIntegerValue(y),
                    lastY = -1;

                if (tableStruct[lastInsertedKey] !== undefined) {
                    lastY = tableAnnotator.getIntegerValue(tableStruct[lastInsertedKey][0].y);
                }

                if (lastInsertedKey !== null && (currentX !== lastX) && (currentY > lastY)) {
                    tableStruct[lastInsertedKey].push({ y : y, cellText : value.textContent });
                    return true; // works as loop continuation, here skipping the loop
                } else {
                    tableStruct[x] = [];
                }
            }
            tableStruct[x].push({ y : y, cellText : value.textContent });
        });

        return tableStruct;
    },


    /**
     * Return the list of all the column start points after eliminating un-necessary start points
     *
     * @param {Array} tableStruct
     * @returns {Array}
     */
    getRefinedColumnStructure : function (tableStruct) {

//        console.log(tableStruct);
        var cols = [], columnStartPoints = [],
            allColumnsIndex = [], previous = '', keys = '';
        for (keys in tableStruct) {
            cols = tableStruct[keys];
            $.each(cols, function (index, value) {
                var searchedItem = $.grep(allColumnsIndex, function (obj) { return obj.y === value.y; });
               // console.log(searchedItem);
                if (!$.isEmptyObject(searchedItem) && value.y !== previous) {
                    if (columnStartPoints[value.y] === undefined) {
                        columnStartPoints[value.y] = 1;
                    } else {
                        columnStartPoints[value.y]++;
                    }
                    previous = value.y;
                }
            });
            allColumnsIndex = cols;
        }

        return tableAnnotator.discardUnwantedStartPoints(columnStartPoints);
    },

    /**
     * Return the selected text based on new column start points values
     *
     * @param {Array} tableStruct
     * @param columnStartPoints
     * @returns {{}}
     */
    getSelectedRowsWithColumnValues : function (tableStruct, columnStartPoints) {

        var indexCount = 0,
            previousColumnStartPoint = 0,
            nextColumnStartPoint = 0,
            tempColumnStartPoint = '',
            columnValue = '',
            rows = '', cols = null,
            currentColumnStartPoint = 0,
            selectedRowsAndColumn = {};
        
        for (rows in tableStruct) {
            cols = tableStruct[rows];
            indexCount = 0;
            columnValue = '';
            selectedRowsAndColumn[rows] = [];

            previousColumnStartPoint = tableAnnotator.INF; // assigned a big(unrealistic ) value
            tempColumnStartPoint = columnStartPoints[indexCount];
            if (tempColumnStartPoint !== undefined) {
                previousColumnStartPoint = tableAnnotator.getIntegerValue(tempColumnStartPoint);
            }

            $.each(cols, function (index, column) {

                nextColumnStartPoint = tableAnnotator.INF; // assigned a big(unrealistic ) value
                tempColumnStartPoint = columnStartPoints[indexCount + 1];
                if (tempColumnStartPoint !== undefined) {
                    nextColumnStartPoint = tableAnnotator.getIntegerValue(tempColumnStartPoint);
                }

                currentColumnStartPoint = tableAnnotator.getIntegerValue(column.y);

                if (currentColumnStartPoint >= previousColumnStartPoint && currentColumnStartPoint < nextColumnStartPoint ) {
                    columnValue += column.cellText;
                } else {
                    if ($.trim(columnValue) !== '') {
                        selectedRowsAndColumn[rows].push(columnValue);
                    }
                    columnValue = '';
                    columnValue +=  column.cellText;
                    previousColumnStartPoint = nextColumnStartPoint;
                    indexCount++;
                }
            });

            if ($.trim(columnValue) !== '') {
                selectedRowsAndColumn[rows].push(columnValue);
            }
        }
        return selectedRowsAndColumn;
    },

    /**
     * Get the integer value from the string containing pixel value
     *
     * i.e 165.12px = 165
     * @param {string} str
     * @returns {int}
     */
    getIntegerValue : function (str) {

        if (str === null || str === undefined || $.trim(str) === '') {
            return tableAnnotator.INVALID;
        }

        return parseInt(str.substr(0, str.length - 2));
    },

    /**
     * Get the last inserted key of the associated array
     *
     * @param tableStruct
     * @returns {Array}
     */
    getLastInsertedKey : function (tableStruct) {

        if ($.isEmptyObject(tableStruct)) {
            return null;
        }

        var keys = Object.keys(tableStruct);
        return keys[keys.length - 1];
    },

    /**
     * Validate the table selection and return necessary boundary value checking
     * It also traverse up and downwards and select the table remaining selection.
     *
     * @param {Array} selectedElements
     * @returns {*}
     */
    getValidatedTableSelectedInfo : function (selectedElements) {

        var isGetTableRangeSuccess = true,
            isSelectionSuggestionPossible = false,
            selectedTableRange = null,
            traversedUpItems = null,
            traversedDownItems = null;
        
        if ($.isEmptyObject(selectedElements)) {
            return null;
        }

        selectedTableRange = tableAnnotator.getSelectedTableRange(selectedElements);

        if (selectedTableRange.min === tableAnnotator.INVALID && selectedTableRange.max === tableAnnotator.INVALID) {
            isGetTableRangeSuccess = false;

            return {
                isGetTableRangeSuccess        : isGetTableRangeSuccess,
                isSelectionSuggestionPossible : isSelectionSuggestionPossible,
                selectedElements              : selectedElements
            };
        }

        traversedUpItems = tableAnnotator.traverseTableUp(selectedElements[0], selectedTableRange);
        traversedDownItems = tableAnnotator.traverseTableDown(
            selectedElements[selectedElements.length - 1], selectedTableRange
        );

        if (!$.isEmptyObject(traversedUpItems) || !$.isEmptyObject(traversedDownItems)) {
            isSelectionSuggestionPossible = true;
        }

        selectedElements = $.merge(traversedUpItems, selectedElements);
        selectedElements = $.merge(selectedElements, traversedDownItems);

        return {
            isGetTableRangeSuccess        : isGetTableRangeSuccess,
            isSelectionSuggestionPossible : isSelectionSuggestionPossible,
            selectedElements              : selectedElements
        };
    },

    /**
     * Traverse upward until the  table top and return all the selected element inside the table
     *
     * @param {HTMLElement} firstElement
     * @param {Object} selectedTableRange
     * @returns {Array}
     */
    traverseTableUp : function (firstElement, selectedTableRange) {

        firstElement = $(firstElement);

        var itemBeforeFirst = $(firstElement.prev()),
            itemLeftPositionBeforeFirstSelectedItem = 0, safeCount = 0,
            hasMore = true, selectedItem = [];

        while (hasMore) {

            if (itemBeforeFirst === undefined) {
                hasMore = false;
                break;
            }

            itemLeftPositionBeforeFirstSelectedItem = tableAnnotator.getIntegerValue(itemBeforeFirst.css('left'));

            if (itemLeftPositionBeforeFirstSelectedItem === tableAnnotator.INVALID ||
                itemLeftPositionBeforeFirstSelectedItem < selectedTableRange.min) {
                hasMore = false;
                break;
            }
//            console.log('pre::' +  itemLeftPositionBeforeFirstSelectedItem + ' txt:: ' + itemBeforeFirst.next());

            selectedItem.push(itemBeforeFirst[0]);
            itemBeforeFirst = $(itemBeforeFirst.prev());

            if (safeCount === tableAnnotator.TABLE_SELECTION_ABORT) {
                messageHandler.showErrorMessage('Error is table selection!!!');
                break;
            }
            safeCount++;
        }

        return selectedItem.reverse();
    },

    /**
     * Traverse downward until the table bottom and return all the traverse elements inside the table
     *
     * @param {HTMLElement} lastItem
     * @param {Object} selectedTableRange
     * @returns {Array}
     */
    traverseTableDown : function (lastItem, selectedTableRange) {

        var lastElement = $(lastItem),
            itemAfterLast = $(lastElement.next()),
            itemLeftPositionAfterLastSelectedItem = 0, safeCount = 0,
            hasMore = true, selectedItem = [];

        while (hasMore) {
            if (itemAfterLast === undefined) {
                hasMore = false;
                break;
            }

            itemLeftPositionAfterLastSelectedItem = tableAnnotator.getIntegerValue(itemAfterLast.css('left'));
            if (itemLeftPositionAfterLastSelectedItem === tableAnnotator.INVALID ||
                itemLeftPositionAfterLastSelectedItem < selectedTableRange.min ||
                itemLeftPositionAfterLastSelectedItem > selectedTableRange.max) {

                hasMore = false;
                break;
            }
//            console.log('next:: ' +  itemLeftPositionAfterLastSelectedItem + ' txt:: ' + itemAfterLast.next());

            selectedItem.push(itemAfterLast[0]);
            itemAfterLast = $(itemAfterLast.next());

            if (safeCount === tableAnnotator.TABLE_SELECTION_ABORT) {
                messageHandler.showErrorMessage('Error is table selection!!!');
                break;
            }
            safeCount++;
        }

        return selectedItem;
    },

    /**
     * Removed the less frequent item for column start points
     *
     * @param {Array} columnStartPoints
     * @returns {Array}
     */
    discardUnwantedStartPoints : function (columnStartPoints) {

        var max = 0, value = 0, refinedValue = [], keys = '';
        for (keys in columnStartPoints) {
            value = columnStartPoints[keys];
            if (value > max) {
                max = value;
            }
        }

        for (keys in columnStartPoints) {
            value = columnStartPoints[keys];
            if (value === max) {
                refinedValue.push(keys);
            }
        }

        return refinedValue;
    },

    /**
     * Return the range of the selected table
     *
     * @param {Array} selectedElements
     * @returns {{min: number, max: number}}
     */
    getSelectedTableRange: function (selectedElements) {

        var left = 0,
            min = tableAnnotator.INF,
            max = 0, i = 0,
            itemIndex = [],
            leftPix = '',
            isEnoughInformationFount = false;

        for (i = 0; i < selectedElements.length; i++) {

            leftPix = selectedElements[i].style.left;
            left = tableAnnotator.getIntegerValue(leftPix);

            if (min > left) {
                min = left;
            }

            if (max < left) {
                max = left;
            }

            if (itemIndex[leftPix] === undefined) {
                itemIndex[leftPix] = {count : 0, left : left};
            }

            itemIndex[leftPix].count++;

            if (itemIndex[leftPix].count === 2) {
                isEnoughInformationFount = true;
                break;
            }

        }

        if (!isEnoughInformationFount) {
            min = tableAnnotator.INVALID;
            max = tableAnnotator.INVALID;
        }

        return {
            min : min,
            max : max
        };
    },

    /**
     * Generate the html table from the selected elements
     *
     * @param {Array} selectedElements
     * @return {void}
     */
    generateHtmlTableForSelectedInfo : function (selectedElements) {

        $("#annotateTableButton").text('Confirm annotation');
        $('#resetAnnotationButton').show();
        $('#viewSelectedInfoFromPfdTable').empty();
        $('#viewSelectedInfoFromPfdTable').show();

        var columnNames = selectedElements[0], tableHeader = '',
            i = 0, j = 0, rowArrayValues = null, rows = '';

        for (i = 0; i < columnNames.length; i++) {
            tableHeader += "<th class = 'showResult'>" + columnNames[i] + "</th>";
        }

        $('#viewSelectedInfoFromPfdTable').append('<br>');
        $('#viewSelectedInfoFromPfdTable').append(
            "<table id='selectedInfoViewer' class = 'showResult' width='100%' >" +
                "<tr class = 'showResult'>" +
                    tableHeader +
                "</tr>" +
            "</table>"
        );

        i = 0;
        j = 0;
        for (i = 1; i < selectedElements.length; i++) {

            rowArrayValues = selectedElements[i];
            rows = '';
//            console.log(rowArrayValues);

            for (j = 0; j < rowArrayValues.length; j++) {
                rows += "<td class = 'showResult' >" + rowArrayValues[j] + "</td>";
            }

            $('#selectedInfoViewer tr:last').after(
                "<tr class = 'showResult'>" +
                    rows +
                "</tr>"
            );
        }
    }
};