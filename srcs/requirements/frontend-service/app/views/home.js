// Cette page affichera la page d'accueil avec les options de login et de register.
import { sendHeartbeat } from '../../tools/tools.js';

// sendHeartbeat();

async function sendPostRequest(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        }
    );
    return response.json();
}

async function sendGetRequest(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        }
    });
    return response.json();
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

export async function home(navigateTo) {
    const div = document.createElement('div');
    div.id = 'home';
    try {
        if (await refreshToken() === true) {
            div.innerHTML = `
                <div class="homeBackground">
                    <div class="home-arcade-button">
                        <div class="home-panel">
                            <button class="option-panel-button" id="profile-button" target="profil">Profil</button>
                            <button class="option-panel-button" id="friends-button" target="friends">Amis</button>
                        </div>
                        <div id="logoutButton">
                            <button class="option" id="LogoutButton" target="logout">Se déconnecter</button>
                        </div>
                    </div>
                </div>
                    <div class="arcade-panel">
                        <div class="screen">
                            <button class="option" target="soloGame">Partie rapide</button>
                            <button class="option" target="iaGame">Affronter l'IA</button>
                            <button class="option" target="createTournament">Tournoi</button>
                        </div>
                    </div>
                </div>
            `;
            const body = document.querySelector('body');
            const background = body.querySelector('#background');
            // <div class="home-arcade-background"></div>

            const soloGameButton = div.querySelector('.option[target="soloGame"]');
            const logoutButton = div.querySelector('.option[target="logout"]');
            const tournamentButton = div.querySelector('.option[target="createTournament"]');
            const iaGameButton = div.querySelector('.option[target="iaGame"]');
            const profileButton = div.querySelector('.option-panel-button[id="profile-button"]');
            const friendsButton = div.querySelector('.option-panel-button[id="friends-button"]');
            // const settingsButton = div.querySelector('.option-panel-button[id="settings-button"]');
            const screen = div.querySelector('.arcade-panel .screen');
            const homeArcadeButton = div.querySelector('.home-arcade-button');

            const buttons = [soloGameButton, tournamentButton, iaGameButton, profileButton, friendsButton];

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    screen.innerHTML = '';
                    homeArcadeButton.innerHTML = '';
                    // background.style.transition = "transform 1s ease";
                    // background.style.transform = "scale(3)";
                    // background.style.transformOrigin = "50% 45%";
                    const destination = '/' + button.getAttribute('target');
                    // if (destination === '/soloGame') {
                    //     navigateTo("/soloGame");
                    // }
                    navigateTo(destination);
            });
            });

            logoutButton.addEventListener('click', () => {
				const url = '/api/userman/update_status/';
				const data = { status_online: false };
				const method = 'POST';
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
				};
				const body = JSON.stringify(data);
				fetch(url, { method, headers, body });
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigateTo('/');
            });
        }
        else {
            div.innerHTML = `
                <div class="homePage">
                    <div id="homeButton">
                        <button class="homeButtonCss" id="ConnectButton">Se connecter</button>
                        <button class="homeButtonCss" id="RegisterButton">S'inscrire</button>
                    </div>
                </div>
            `;
            const body = document.querySelector('body');
            const connectButton = div.querySelector('#ConnectButton');
            const registerButton = div.querySelector('#RegisterButton');
            const homeButton = div.querySelector('#homeButton');
            const background = body.querySelector('#background');
            connectButton.addEventListener('click', () => {
                background.style.transition = "transform 1s ease";
                background.style.transform = "scale(3)";
                background.style.transformOrigin = "50% 45%";
                homeButton.innerHTML = '';
                navigateTo('/login');
            });
            registerButton.addEventListener('click', () => {
                background.style.transition = "transform 1s ease";
                background.style.transform = "scale(3)";
                background.style.transformOrigin = "50% 45%";
                homeButton.innerHTML = '';
                navigateTo('/register');
            });
        }
    }
    catch (error) {
        console.error(error);
        div.innerHTML = `
            <h1 id="title">Error</h1>
        `;
    }
    return div;
}
