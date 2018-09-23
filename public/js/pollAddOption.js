function addOption(e) {
    let id = e.target.id.replace('submitAddOption', '');
    let option = document.getElementById('formAddOption' + id).value;

    let options;
    for (var i = 0; i < polls.length; i++) {
        if (polls[i].id === id) {
            options = polls[i].options;
            break;
        }
    }
    
    if (options.includes(option)) {
        preloader('start', 'AddOption' + id);
        setTimeout(function(){ // setTimeout() is necessary to re-draw xMark.
            preloader('fail', 'AddOption' + id);
            document.getElementById('errorAddOption' + id).classList.add('visible');
        }, 1);
    } else {
        if (option < 1) {
            let inputEl = document.getElementById('formAddOption' + id);
            let errorEl = document.getElementById('formAddOptionError' + id);
            showErrors(inputEl, errorEl);
            inputEl.addEventListener('input', function listener() {
                if (inputEl.value.length >= 1) {
                    hideErrors(inputEl, errorEl);
                    inputEl.removeEventListener('input', listener);
                }
            });
        } else {
            preloader('start', 'AddOption' + id);
            $.ajax({
                method: "POST",
                url: "/add-option",
                data: {id, option}
            }).done(function() {
                preloader('success', 'AddOption' + id);
                location.reload();
            }).fail(function(response) {
                preloader('fail', 'AddOption' + id);
                if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    alert('Unexpected server error. Please try again later.');
                }
            });
        }
    }
}
let addOptionButtons = document.getElementsByClassName('addOptionBtn');
for (addOptionButton of addOptionButtons) {
    addOptionButton.addEventListener('click', addOption);
}
