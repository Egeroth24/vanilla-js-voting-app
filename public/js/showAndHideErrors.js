function showErrors(inputEl, errorEl) {
    inputEl.classList.add('invalid');
    errorEl.classList.add('visible');
}
function hideErrors(inputEl, errorEl) {
    inputEl.classList.remove('invalid');
    errorEl.classList.remove('visible');
}
