// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://vsapps.aphis.usda.gov/vsps/labs/editTestRecord.do
// @icon         https://www.google.com/s2/favicons?sz=64&domain=usda.gov
// @grant        none
// ==/UserScript==

alert('hello from github');

waitForKeyElements = (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) => {
    var targetNodes, btargetsFound;
0
    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}

window.addCogginsLinks = () => {
    $('#chart_wrapper .dataTable tr').each(function(){
        if($(this).find('td').length === 0)
            return;

        var submissionStatus = $(this).find('td').get(9);
        if($(submissionStatus).html() == 'Unsubmitted')
            return;

        var serialNumberCell = $(this).find('td').get(2);
        var $cell = $(serialNumberCell);
        //var specimenId = $cell.html();

        $cell.css('text-decoration', 'underline');
        $cell.css('color', 'green');
        $cell.css('cursor', 'pointer');

        var recordId = '';

        $($(this).find('td').get(1)).find('a').each(function( index ) {
            var $link = $(this);
            if($link.attr('onclick').includes('onView')) {
                recordId = $link.attr('onclick').substring(8,15);
            }
        });

        if(recordId === '')
            return;

        $cell.click(function() {
           openTestRecordPdf(recordId, "DISPLAY");
        });

    })
};

window.openTestRecordPdf = (recordId, mode) => {
    document.getElementById("testRecordID").value = recordId;
    document.testRecordForm.action="labs/editTestRecord.do?quickopen=true";
    document.testRecordForm.method.value='openTestRecord';
    document.testRecordForm.mode.value=mode;
    document.testRecordForm.menuPath.value = document.findTestChartForm.menuPath.value;
    document.testRecordForm.target = '_blank';
    document.testRecordForm.submit();
};



(function() {
    'use strict';

    window.waitForKeyElements('form[name=findTestChartForm]', function() {
        var urlParams = new URLSearchParams(window.location.search);

        //window.addCogginsLinks();
        $('#chart').on('draw.dt', function() {
            setTimeout(() => {
                window.addCogginsLinks();
            }, 750);
        });

    }, false);

    window.waitForKeyElements('#confirmdata', function() {
        $('#confirmdata').prop("checked", true);
    }, false);

    window.waitForKeyElements('form[name=labSetupAnimalForm]', function() {
        $('#listAction').val('action.add');
    }, false);

    window.waitForKeyElements('form[name=testRecordForm]', function() {
        var urlParams = new URLSearchParams(window.location.search);

        var quickPdfOpen = urlParams.has('quickopen');
        if(quickPdfOpen) {
            $('button').each(function() {
                if($(this).html() === 'Show VS 10-11')
                    $(this).click();
            });
        }

        var $vetSelector = $('#tcVetId');
        if($vetSelector.length > 0 && $vetSelector.val() != '') {
            $('#vetaccredState option').filter(function(){
                    return $(this).text() == 'North Carolina';
                }).attr('selected', true);

            if($('#tcSpecies').val() == '') {
                $('#tcSpecies').val('EQU');
                $('#tcSpecies').trigger('onchange');
            }
            else {
                if($('#tcDiseaseSelect').val() == '') {
                    $('#tcDiseaseSelect').val('EIA');
                    $('#tcDiseaseSelect').trigger('onchange');
                }

                if($('#tcTestReasonSelect').val() == '') {
                    $('#tcTestReasonSelect').val('1070');
                    //$('#tcTestReasonSelect').trigger('onchange');
                }

                if($('#tcTestMethodSelect').val() == '') {
                    $('#tcTestMethodSelect').val('6');
                }
            }
        }

    }, false);


})();
