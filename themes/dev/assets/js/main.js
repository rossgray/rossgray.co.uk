const navButton = document.querySelector('#nav-button');

function toggleNav() {
    const expanded = navButton.getAttribute('aria-expanded') === 'true' || false;
    navButton.setAttribute('aria-expanded', !expanded);
}

navButton.addEventListener('click', toggleNav);