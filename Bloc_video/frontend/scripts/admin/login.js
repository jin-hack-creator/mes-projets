import { supabase } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        emailInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');

        loginButton.classList.add('loading');
        loginButton.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        loginButton.classList.remove('loading');
        loginButton.disabled = false;

        if (error) {
            errorMessage.textContent = `Erreur de connexion: ${error.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');

            if (error.message.includes('email')) {
                emailInput.classList.add('input-error');
            }
            if (error.message.includes('password')) {
                passwordInput.classList.add('input-error');
            }
        } else {
            window.location.href = '/frontend/pages/admin/dashboard.html';
        }
    });
});