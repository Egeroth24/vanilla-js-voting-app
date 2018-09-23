function preloader(action, el) {
    let preloader = document.getElementById('preloader' + el);
    let xMarkContainer = document.getElementById('xMarkContainer' + el);
    let xMark1 = document.getElementById('xMark1' + el);
    let xMark2 = document.getElementById('xMark2' + el);
    let checkmark = document.getElementById('checkmark' + el);
    let error = document.getElementById('error' + el);

    function start() {
        preloader.classList.add('active');
        xMarkContainer.style.visibility = 'hidden';
        xMark1.classList.remove('draw');
        xMark2.classList.remove('draw');
        checkmark.style.visibility = 'hidden';
        checkmark.classList.remove('draw');
        error.classList.remove('visible');
    }

    function success() {
        preloader.classList.remove('active');
        checkmark.style.visibility = 'visible';
        checkmark.classList.add('draw');
    }

    function fail() {
        preloader.classList.remove('active');
        xMarkContainer.style.visibility = 'visible';
        xMark1.classList.add('draw');
        xMark2.classList.add('draw');
    }
    
    if (action === 'start') {
        start();
    } else if (action === 'success') {
        success();
    } else if (action === 'fail') {
        fail();
    }
}
