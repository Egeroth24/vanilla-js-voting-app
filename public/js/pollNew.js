function newPoll() {

    // Title Validation
    if (formTitle.value.length < 4) {
        showErrors(formTitle, formTitleError);
        formTitle.addEventListener('input', function listener() {
            if (formTitle.value.length >= 4) {
                hideErrors(formTitle, formTitleError);
                formTitle.removeEventListener('input', listener);
            }
        });
    }

    // Options Validation
    let optionsChips = $('#formOptions').material_chip('data');
    if (optionsChips.length < 2) {
        let formOptionsInput = formOptions.getElementsByTagName('input')[0];
        showErrors(formOptionsInput, formOptionsError);
        $('.chips').on('chip.add', function listener(){
            optionsChips = $('#formOptions').material_chip('data');
            if (optionsChips.length >= 2) {
                hideErrors(formOptionsInput, formOptionsError);
                $('.chips').off();
            }
        });
    }

    let formOptionsInput = formOptions.getElementsByTagName('input')[0];
    if (!(formTitle.classList.contains('invalid') || formOptionsInput.classList.contains('invalid'))) {
        let title = formTitle.value;

        let options = [];
        for (var i = 0; i < optionsChips.length; i++) {
            options[i] = optionsChips[i].tag;
        }
        
        let data = {title: title, options: options,};
        preloader('start', 'NewPoll');
        $.ajax({
            method: "POST",
            url: "/new-poll",
            data: data
        }).done(function(response) {
            preloader('success', 'NewPoll');
            if (window.location.pathname !== '/admin') {
                window.location.href = '/polls/' + response;
            }
        }).fail(function(response) {
            preloader('fail', 'NewPoll');
            if (response.status === 401) {
                window.location.href = '/login';
            } else if (response.status === 409) {
                document.getElementById('errorNewPoll').classList.add('visible');
            } else {
                alert('Unexpected server error, please try again later.');
            }
        });
    }

}
document.getElementById('submitNewPoll').addEventListener('click', newPoll);
