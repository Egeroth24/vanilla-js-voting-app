function loginUser() {

    // Username Validation
    if (formUser.value.length < 4) {
        showErrors(formUser, formUserError);
        formUser.addEventListener('input', function listener() {
            if (formUser.value.length >= 4) {
                hideErrors(formUser, formUserError);
                formUser.removeEventListener('input', listener);
            }
        });
    }

    //Password Validation
    if (formPassword.value.length < 8) {
        showErrors(formPassword, formPasswordError);
        formPassword.addEventListener('input', function listener() {
            if (formPassword.value.length >= 8) {
                hideErrors(formPassword, formPasswordError);
                formPassword.removeEventListener('input', listener);
            }
        });
    }

    if (!(formUser.classList.contains('invalid') || formPassword.classList.contains('invalid'))) {
        let data = {username: formUser.value, password: formPassword.value};
        preloader('start', 'Login');
        $.ajax({
            method: "POST",
            url: "/login",
            data:  data
        }).done(function() {
            preloader('success', 'Login');
            window.location = '/';
        }).fail(function(response) {
            preloader('fail', 'Login');
            if (response.status === 401) {
                document.getElementById('errorLogin').classList.add('visible');
            } else {
                alert('Unexpected server error, please try again later.');
            }
        });
    }
}
document.getElementById('submitLogin').addEventListener('click', loginUser);
