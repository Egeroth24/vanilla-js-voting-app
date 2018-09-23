function userDelete(e) {
    let username = e.target.id;
    $.ajax({
        method: "POST",
        url: "/delete-user",
        data: {username}
    }).done(function() {
        document.getElementById(username).remove();
    }).fail(function(response) {
        if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('Unexpected server error. Please try again later.');
        }
    });
}
let deleteUserBtns = document.getElementsByClassName('deleteUserBtn');
for (deleteUserBtn of deleteUserBtns) {
    deleteUserBtn.addEventListener('click', userDelete);
}
