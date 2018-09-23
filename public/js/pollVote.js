function pollVote(e) {
    let id = e.target.id.replace('submitVote', '');
    let optionIndex = $('#formVoteSelect' + id).val();
    let inputEl = document.getElementById('formVoteSelect' + id);
    let errorEl = document.getElementById('formVoteError' + id);

    if (optionIndex === null) {
        showErrors(inputEl, errorEl);
        $('#voteSelectWrapper').on('change', 'select', function() {
            hideErrors(inputEl, errorEl);
            $('#voteSelectWrapper').off('change');
        });
    } else {
        preloader('start', 'Vote' + id);
        $.ajax({
            method: "POST",
            url: "/vote",
            data: {id, optionIndex}
        }).done(function() {
            preloader('success', 'Vote' + id);
            location.reload();
        }).fail(function(response) {
            preloader('fail', 'Vote' + id);
            if (response.status === 409) {
                document.getElementById('errorVote' + id).classList.add('visible');
            } else {
                alert('Unexpected server error. Please try again later.');
            }
        });
    }
}
let voteButtons = document.getElementsByClassName('voteBtn');
for (voteButton of voteButtons) {
    voteButton.addEventListener('click', pollVote);
}
