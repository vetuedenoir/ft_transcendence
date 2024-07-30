import { sendHeartbeat } from '../../tools/tools.js';

// sendHeartbeat();

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

export async function login(navigateTo) {
    if (await refreshToken() === true) {
        //console.log('Already logged in');
        navigateTo('/');
        const element = document.createElement('div');
        return element;
    }
    const element = document.createElement('div');
    element.id = 'login';
    element.innerHTML = `
        <h1>Connexion</h1>
        <form id="loginForm">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Mot de passe" required>
            <button class="homeButtonCss" type="submit">Se connecter</button>
            <div class="sign-up-link">Vous n'avez pas de compte ?
                <a href="/register" id="link">S'inscrire</a>
            </div>
        </form>
        <div class="invalid-otp"></div>

    `;

    const form = element.querySelector('#loginForm');
    const registerLink = element.querySelector('#link');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const email = escapeHTML(formData.get('email'));
        const password = escapeHTML(formData.get('password'));
        const invalidOtp = document.querySelector('.invalid-otp');
        if (!email || !password) {
            invalidOtp.textContent = 'Veuillez remplir tous les champs.';
            return;
        }
        if (email.length > 50 || password.length > 50) {
            invalidOtp.textContent = 'Email ou mot de passe trop long.';
            return;
        }
        try {
            const response = await sendPostRequest('/api/auth/login/', { email, password });
            if (response.access && response.refresh) {
                localStorage.setItem('access_token', response.access);
                localStorage.setItem('refresh_token', response.refresh);
				const url = '/api/userman/update_status/';
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + localStorage.getItem('access_token')
				}
				const data = { status_online: true };
				const body = JSON.stringify(data);
				const method = 'POST';
				await fetch(url, { method, headers, body });
				sendHeartbeat();
				//console.log("HERE");
                navigateTo('/');
            }
            else if (response.otp_required) {
                element.innerHTML = '';
                element.id = 'login_2fa';
                element.innerHTML = `
                    <h1>Authentification à deux facteurs.</h1>
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
								//console.log("HERE");
                                event.preventDefault();
                                const verifyResponse = await sendPostRequest('/api/auth/login/', { email, password, otp_token: otp});
                                if (verifyResponse.access && verifyResponse.refresh) {
									localStorage.setItem('access_token', verifyResponse.access);
                                    localStorage.setItem('refresh_token', verifyResponse.refresh);
									const url1 = '/api/userman/update_status/';
									const data1 = { status_online: true };
									const response1 = await sendPostRequest(url1, data1);
									const headers1 = {
										'Content-Type': 'application/json',
										'Authorization': 'Bearer ' + localStorage.getItem('access_token')
									}
									const body1 = JSON.stringify(data1);
									const method = 'POST';
									await fetch(url1, { method, headers1, body1 });
									//console.log(response1);
                                    navigateTo('/');
                                }
                                else {
                                    if (verifyResponse.otp_user == 'Utilisateur introuvable.') {
                                        const invalidOtp = document.querySelector('.invalid-otp');
                                        invalidOtp.innerHTML = '';
                                        invalidOtp.textContent = 'Utilisateur introuvable.';
                                    }
                                    else {
                                        const invalidOtp = document.querySelector('.invalid-otp');
                                        invalidOtp.innerHTML = '';
                                        invalidOtp.textContent = 'Code invalide';
                                    }
                                }
                            });
                        }
                    });
                });
            }
            else {
                const invalidOtp = document.querySelector('.invalid-otp');
                invalidOtp.innerHTML = '';
                invalidOtp.textContent = 'Les informations fournies ne permettent pas de se connecter.';
            }
        }
        catch (error) {
            console.error(error);
        }
    });

    registerLink.addEventListener('click', async (event) => {
        event.preventDefault();
        navigateTo('/register');
    });

    return element;
}
