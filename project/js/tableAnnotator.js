/**
 * This js file contains functionality for table annotation.
 *
 * @authors : A Q M Saiful Islam, Jaana Takis
 * @dependency: none
 */

var tableAnnotator  = {

    /**
     *
     * @returns {Array}
     */
    getSelectedTableCellTexts : function(){

        var selectedElements = tableAnnotator.getSelectedElementTags(window),
            selectedTexts = [] ;
        $.each( selectedElements, function( index, value ){
            if(tableAnnotator.isDivContainText(value)) {
//                console.log(value.textContent);
                selectedTexts.push(value.textContent);
            }
        });
        return selectedTexts;
    },

    /**
     *
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
     *
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
     *
     * @param selector
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {Array}
     */
    rectangleSelect : function(selector, x1, y1, x2, y2) {
        var elements = [];
        jQuery(selector).each(function() {
            var $this = jQuery(this);
            var offset = $this.offset();
            var x = offset.left;
            var y = offset.top;
            var w = $this.width();
            var h = $this.height();

            if (x >= x1
                && y >= y1
                && x + w <= x2
                && y + h <= y2) {
                // this element fits inside the selection rectangle
                elements.push($this.get(0));
            }
        });
        return elements;
    },

    /**
     *
     * @param div
     * @returns {boolean}
     */
    isDivContainText : function(div) {
        return div.hasAttribute('data-canvas-width');
    }
};
