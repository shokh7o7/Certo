'use strict';

const APP = {
    config: {
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        submitDelay: 1400,
        resetDelay: 2400,
        toastDuration: 3200,
    },
    state: {
        isSubmitting: false,
    },
};

const createToast = (message, type = 'info') => {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.remove(), 400);
    }, APP.config.toastDuration);
};

const initDropdown = () => {
    const dropdown = document.querySelector('.navbar__dropdown');
    if (!dropdown) return;

    const toggle = dropdown.querySelector('.navbar__dropdown-toggle');
    const menu = dropdown.querySelector('.navbar__dropdown-menu');
    if (!toggle || !menu) return;

    const close = () => {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
        dropdown.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.contains('is-open') ? close() : open();
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', close);
    });
};

const initSignupModal = () => {
    const modal = document.getElementById('signupModal');
    const form = document.getElementById('signupForm');
    const authBtn = document.getElementById('authBtn');
    if (!modal || !form || !authBtn) return;

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => form.querySelector('#email').focus(), 200);
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        form.reset();
        clearErrors();
    };

    authBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    const showError = (field, message) => {
        const el = form.querySelector(`[data-error="${field}"]`);
        if (el) el.textContent = message;
        const input = form.querySelector(`#${field}`);
        if (input) input.classList.add('is-error');
    };

    const clearErrors = () => {
        form.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
        form.querySelectorAll('.is-error').forEach((el) => el.classList.remove('is-error'));
    };

    const validate = () => {
        clearErrors();
        let valid = true;

        const email = form.email.value.trim();
        const password = form.password.value;

        if (!APP.config.emailRegex.test(email)) {
            showError('email', 'Please enter a valid email');
            valid = false;
        }

        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            valid = false;
        }

        return valid;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const submitBtn = form.querySelector('.modal__submit');
        const original = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            await new Promise((r) => setTimeout(r, 1200));

            submitBtn.textContent = '✓ Account created';
            submitBtn.classList.add('is-success');
            createToast('Welcome to Certo!', 'success');

            setTimeout(() => {
                closeModal();
                submitBtn.textContent = original;
                submitBtn.classList.remove('is-success');
                submitBtn.disabled = false;

                authBtn.textContent = 'My Account';
                authBtn.classList.add('is-logged');
            }, 1000);
        } catch (err) {
            submitBtn.textContent = original;
            submitBtn.disabled = false;
            showError('email', 'Something went wrong. Try again.');
        }
    });
};

const handleNewsletter = () => {
    const form = document.querySelector('.newsletter__form');
    if (!form) return;

    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button');
    if (!input || !button) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (APP.state.isSubmitting) return;

        const email = input.value.trim();

        if (!email || !APP.config.emailRegex.test(email)) {
            createToast('Please enter a valid email address', 'error');
            input.classList.add('is-error');
            setTimeout(() => input.classList.remove('is-error'), 1500);
            return;
        }

        APP.state.isSubmitting = true;
        button.disabled = true;
        button.textContent = 'Subscribing...';
        input.disabled = true;

        try {
            await new Promise((r) => setTimeout(r, APP.config.submitDelay));

            button.textContent = 'Subscribed ✓';
            createToast('Successfully subscribed to the newsletter', 'success');
            input.value = '';

            setTimeout(() => {
                button.textContent = 'Submit';
                button.disabled = false;
                input.disabled = false;
                APP.state.isSubmitting = false;
            }, APP.config.resetDelay);
        } catch (err) {
            createToast('Something went wrong. Try again.', 'error');
            button.textContent = 'Submit';
            button.disabled = false;
            input.disabled = false;
            APP.state.isSubmitting = false;
        }
    });
};

const handleHelpCenter = () => {
    const help = document.getElementById('kelp');
    if (!help) return;

    help.addEventListener('click', async (e) => {
        e.preventDefault();
        const original = help.textContent;
        help.textContent = 'Opening...';
        help.style.pointerEvents = 'none';

        await new Promise((r) => setTimeout(r, 800));

        createToast('Help center is opening...', 'info');
        help.textContent = original;
        help.style.pointerEvents = '';

        setTimeout(() => {
            window.location.hash = '#help';
        }, 400);
    });
};

const initScrollReveal = () => {
    const elements = document.querySelectorAll(
        '.review-card, .feature, .promo-card, .section-title'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
};

const initNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener(
        'scroll',
        () => {
            if (window.scrollY > 20) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        },
        { passive: true }
    );
};

const initSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
};

const init = () => {
    initDropdown();
    initSignupModal();
    handleNewsletter();
    handleHelpCenter();
    initScrollReveal();
    initNavbarScroll();
    initSmoothAnchors();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}