function registerUser() {

    // Username Validation
    if (formUser.value.length < 4) {
        formUserError.innerHTML = 'Username must be at least 4 characters long.'; // May have been set to 'Username unavailable.'
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

    // Password Match Validation
    if (formPasswordMatch.value !== formPassword.value) {
        showErrors(formPasswordMatch, formPasswordMatchError);
        formPasswordMatch.addEventListener('input', function listener() {
            if (formPasswordMatch.value === formPassword.value) {
                hideErrors(formPasswordMatch, formPasswordMatchError);
                formPasswordMatch.removeEventListener('input', listener);
            }
        });
        formPassword.addEventListener('input', function listener() {
            if (formPasswordMatch.value === formPassword.value) {
                hideErrors(formPasswordMatch, formPasswordMatchError);
                formPasswordMatch.removeEventListener('input', listener);
            }
        });
    }

    if (!(formUser.classList.contains('invalid') || formPassword.classList.contains('invalid') || formPasswordMatch.classList.contains('invalid'))) {
        let data = {username: formUser.value, password: formPassword.value};
        preloader('start', 'Register');
        $.ajax({
            method: "POST",
            url: "/register",
            data:  data
        }).done(function() {
            preloader('success', 'Register');
            if (window.location.pathname !== '/admin') {
                window.location = '/';
            }
        }).fail(function(response) {
            if (response.status === 401) {
                // Username not available.
                preloader('fail', 'Register');
                document.getElementById('errorRegister').classList.add('visible');
            } else {
                alert('Unexpected server error. Please try again later.');
            }
        });
    }
}
document.getElementById('submitRegister').addEventListener('click', registerUser);
