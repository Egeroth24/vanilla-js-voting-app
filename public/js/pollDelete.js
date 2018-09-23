function deletePoll(e) {
    let id = e.target.id;
    $.ajax({
        method: "POST",
        url: "/delete-poll",
        data: {id}
    }).done(function() {
        if (window.location.pathname === '/admin') {
            document.getElementById(id).parentElement.remove();
        } else {
            document.getElementById(id).parentElement.parentElement.remove();
        } 
    }).fail(function(response) {
        if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('Unexpected server error. Please try again later.');
        }
    });
}
let deletePollButtons = document.getElementsByClassName('deletePollBtn');
for (let deletePollButton of deletePollButtons) {
    deletePollButton.addEventListener('click', deletePoll);
}
