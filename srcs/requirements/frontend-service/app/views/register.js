
// TODO : supprimer les console.log

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return escape[match];
    });
}

async function refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
        const response = await sendPostRequest('/api/auth/refresh/', { refresh: refresh_token });
        if (response.access) {
            localStorage.setItem('access_token', response.access);
            return true;
        }
        else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return false;
        }
    }
    else {
        return false;
    }
}

async function sendPostRequest(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

export async function register(navigateTo) {
    if (await refreshToken() === true) {
        //console.log('Already logged in');
        navigateTo('/');
        const element = document.createElement('div');
        return element;
    }

    const element = document.createElement('div');
    element.id = 'register';
    element.innerHTML = `
        <div class="register-page">
            <h1>Inscription</h1>
            <form id="registerForm">
                <input type="text" name="name" placeholder="Nom" required>
                <input type="text" name="firstname" placeholder="Prénom" required>
                <input type="text" name="username" placeholder="Nom d'utilisateur" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Mot de passe" required>
                <input type="password" name="password2" placeholder="Confirmer le mot de passe" required>
                <div class="two-fa-button">
                    <div class="checkbox">
                        <input type="checkbox" name="checkbox">
                    </div>
                    <div class=two-fa-label></div>
                </div>
                <button class="homeButtonCss" type="submit">S'inscrire</button>
                <div class="password-policy"></div>
                <div class="sign-up-link">Vous avez déjà un compte ?
                    <a href="/login" id="link">Se connecter</a>
                </div>
            </form>
        </div>

    `;
    const checkbox = element.querySelector('.checkbox');
    const label = element.querySelector('.two-fa-label');
    const input = element.querySelector('input[type="checkbox"]');
    const passwordPolicy = element.querySelector('.password-policy');
    checkbox.addEventListener('click', (event) => {
        if (input.checked) {
            label.classList.toggle('check');
        }
        else {
            label.classList.remove('check');
        }
    });

    const form = element.querySelector('#registerForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const name = escapeHTML(formData.get('name'));
        const firstname = escapeHTML(formData.get('firstname'));
        const username = escapeHTML(formData.get('username'));
        const email = escapeHTML(formData.get('email'));
        const password = escapeHTML(formData.get('password'));
        const password2 = escapeHTML(formData.get('password2'));
        const twoFa = input.checked;
        //console.log(name, firstname, email, password, twoFa);
        if (password !== password2) {
            passwordPolicy.innerHTML = '';
            passwordPolicy.innerHTML = 'Les mots de passe ne correspondent pas';
            return;
        }
        if (firstname === '' || name === '' || email === '' || password === '' || password2 === '') {
            passwordPolicy.innerHTML = '';
            passwordPolicy.innerHTML = 'Veuillez remplir tous les champs';
            return;
        }
        if (firstname.length > 15 || username.length > 15 || name.length > 15 || email.length > 50 || password.length > 50 || password2.length > 50) {
            passwordPolicy.innerHTML = '';
            passwordPolicy.innerHTML = 'Les champs sont trop longs';
            return;
        }
        // TODO : rajouter les regex pour le mot de passe
        // TODO : rajouter la requête fetch pour envoyer les données au serveur
        try {
            const response = await sendPostRequest('/api/auth/register/', { email, password, password2, first_name: firstname, last_name: name, otp_enabled: twoFa, username});
            if (response.email === email && response.username === username) {
                if (response.qr_code) {
                    element.innerHTML = '';
                    element.id = 'register_2fa';
                    element.innerHTML = `
                        <h1>Authentification à deux facteurs</h1>
                        <div class="qr-code">
                            <img src="${response.qr_code}" alt="QR Code">
                        </div>
                        <div class="otp-input-container">
                            <input type="text" maxlength="1" pattern="[0-9]" />
                            <input type="text" maxlength="1" pattern="[0-9]" />
                            <input type="text" maxlength="1" pattern="[0-9]" />
                            <input type="text" maxlength="1" pattern="[0-9]" />
                            <input type="text" maxlength="1" pattern="[0-9]" />
                            <input type="text" maxlength="1" pattern="[0-9]" />
                        </div>
                        <div class="submit-button-before"></div>
                        <div class="invalid-otp"></div>
                        `;
                    const otpInputs = element.querySelectorAll('.otp-input-container input');
                    otpInputs.forEach((input, index) => {
                        input.addEventListener('input', (event) => {
                            const value = input.value.replace(/[^0-9]/g, ''); // Nettoyer la valeur
                            input.value = value;
                            if (value.length === 1 && index < otpInputs.length - 1) {
                                otpInputs[index + 1].focus();
                            }
                            else if (value.length === 0 && index > 0) {
                                otpInputs[index - 1].focus();
                            }
                            if (index === otpInputs.length - 1 && value.length === 1) {
                                const submitButton = element.querySelector('.submit-button-before');
                                submitButton.innerHTML = '';
                                submitButton.textContent = 'Valider';
                                submitButton.classList.add('submit-button');
                                submitButton.classList.add('homeButtonCss');
                                const otp = Array.from(otpInputs).map(input => input.value).join('');
                                //console.log(otp);
                                submitButton.addEventListener('click', async (event) => {
                                    event.preventDefault();
                                    const verifyResponse = await sendPostRequest('/api/auth/verify/', { otp_token: otp, email: email});
                                    if (verifyResponse.success === 'success') {
                                        navigateTo('/login');
                                    }
                                    else {
                                        const invalidOtp = document.querySelector('.invalid-otp');
                                        invalidOtp.innerHTML = '';
                                        invalidOtp.textContent = 'Code invalide';
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    navigateTo('/login');
                }
            }
            else {
                if (response.email !== email) {
                    passwordPolicy.innerHTML = '';
                    passwordPolicy.innerHTML = "Un user avec ces champs existe déjà";
                }
                else if (response.username !== username) {
                    passwordPolicy.innerHTML = '';
                    passwordPolicy.innerHTML = "Un user avec ces champs existe déjà";
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
    return element;
}
