addCogginsLinks = () => {
    $('#chart_wrapper .dataTable tr').each(function(){
        if($(this).find('td').length === 0)
            return; 

        var submissionStatus = $(this).find('td').get(9);
        if($(submissionStatus).html() == 'Unsubmitted')
            return; 

        var serialNumberCell = $(this).find('td').get(2);
        var $cell = $(serialNumberCell);

        $cell.css('text-decoration', 'underline');
        $cell.css('color', 'green');
        $cell.css('cursor', 'pointer');

        var recordId = '';

        $($(this).find('td').get(1)).find('a').each(function(index) {
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

openTestRecordPdf = (recordId, mode) => {
    document.getElementById("testRecordID").value = recordId;
    document.testRecordForm.action="labs/editTestRecord.do?quickopen=true";
    document.testRecordForm.method.value='openTestRecord';
    document.testRecordForm.mode.value=mode;
    document.testRecordForm.menuPath.value = document.findTestChartForm.menuPath.value;
    document.testRecordForm.target = '_blank';
    document.testRecordForm.submit();
};

runCogginsScript = () => { 
    waitForKeyElements('form[name=findTestChartForm]', function() {
        var urlParams = new URLSearchParams(window.location.search);

        $('#chart').on('draw.dt', function() {
            setTimeout(() => {
                addCogginsLinks();
            }, 750);
        });
    }, false);

    waitForKeyElements('#confirmdata', function() {
        $('#confirmdata').prop("checked", true);
    }, false);

    waitForKeyElements('form[name=labSetupAnimalForm]', function() {
        $('#listAction').val('action.add');
    }, false);

    waitForKeyElements('form[name=testRecordForm]', function() {
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
                }
                
                if($('#tcTestMethodSelect').val() == '') {
                    $('#tcTestMethodSelect').val('6');
                }
            }
        }
    }, false);
};