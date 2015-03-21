/**
Parse the json response from virtuso server

 @authors : A Q M Saiful Islam

 @dependency
 null
 */

var messageHandler  = {

    /**
     * Display success message
     * @param message
     * @return void
     */
    showSuccessMessage:function (message) {
        var selector = '.alert-success';
        $(selector).html(message);
        $(selector).fadeIn(1000);
        $(selector).delay(1500).fadeOut();
    },

    /**
     * Display error message
     * @param message
     * @return void
     */
    showErrorMessage:function (message, isHide) {

        var isHide = isHide || false;
        var selector = '.alert-danger';
        $(selector).html(message);
        $(selector).fadeIn(500);
        if(isHide == true) {
            $(selector).delay(1500).fadeOut();
        }else {
            $(selector).show();
        }
    },

    /**
     * Display warning message
     * @param message
     */
    showWarningMessage:function (message) {
        var selector = '.alert-warning';
        $(selector).html(message);
        $(selector).fadeIn(500);
        $(selector).delay(1500).fadeOut();
    },

    /**
     * Clear all the messages
     */
    clearMessage : function() {
        var selector = '.alert-danger';
        $(selector).html('');
        $(selector).hide();

        selector = '.alert-warning';
        $(selector).html('');
        $(selector).hide();
    },

    /**
     * Display message in given element
     * @param {String} message
     * @param {Object} element where to display the message
     * @param optional boolean value to define whether to show message temporarily only.
     * @return void
     */
    displayInfo:function(message, displayInElement, isHide) {
        var isHide = isHide || false; //optional parameter
        displayInElement.html(message);
        if (!displayInElement.is(':visible')) displayInElement.fadeIn(1000);
        if(isHide == true) {
            displayInElement.delay(1500).fadeOut();
        }
    },

    /**
     * Return the standard error message if the server communication is failed
     *
     * @param exception
     * @param jqXHR
     * @param serverAddress
     */
    getStandardErrorMessage : function (jqXHR, exception, serverAddress) {
        var errorTxt = "Error occurred when sending data to the server: " + serverAddress;

        if (jqXHR.status === 0) {
            errorTxt = errorTxt + '<br>Not connected. Verify network.';
        } else if (jqXHR.status === 404) {
            errorTxt = errorTxt + '<br>Request cannot be fulfilled by the server. Check whether the <br />(a) sparql endpoint is available at the above address <br>(b) query contains bad syntax.';
        } else if (jqXHR.status === 500) {
            errorTxt = errorTxt + '<br>Internal server error [500].';
        } else if (exception === 'parsererror') {
            errorTxt = errorTxt + '<br>Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            errorTxt = errorTxt + '<br>Timeout error.';
        } else if (exception === 'abort') {
            errorTxt = errorTxt + '<br>Ajax request aborted.';
        } else {
            errorTxt = errorTxt + '<br>Uncaught Error.\n' + jqXHR.responseText;
        }

        if (scientificAnnotation.DEBUG) {
            console.error(errorTxt);
        }

        return errorTxt;
    }
};

