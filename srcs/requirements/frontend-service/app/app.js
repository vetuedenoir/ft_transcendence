import { home } from './views/home.js';
import { login } from './views/login.js';
import { register } from './views/register.js';
import { profil } from './views/pages/profil.js';
import { friends } from './views/pages/friends.js';
import { iaGame } from './views/pages/iaGame.js';
import { soloGame } from './views/pages/soloGame.js';
import { createTournament } from './views/pages/createTournament.js';
import { previewTournament } from './views/pages/previewTournament.js';
import { inTournamentDisplay } from './views/pages/inTournamentDisplay.js';
import { endTournamentDisplay } from './views/pages/endTournamentDisplay.js';
import { stopFleche } from './game/game.js';
import { stopFlecheIA } from './ia_bot/ia.js';
import { sendHeartbeat } from '../../tools/tools.js';

let currentPath = window.location.pathname;

const app = document.getElementById('app');
const body = document.querySelector('body');
const background = body.querySelector('#background');

let lastPath = window.location.pathname;

const routes = [
    { path: '/', view: home },
    { path: '/login', view: login },
    { path: '/register', view: register },
    { path: '/profil', view: profil },
    { path: '/friends', view: friends },
    { path: '/iaGame', view: iaGame },
    { path: '/soloGame', view: soloGame },
    // { path: '/soloGame/:id', view: soloGame },
    { path: '/createTournament', view: createTournament },
    // { path: '/inTournamentDisplay/:id', view: inTournamentDisplay },
    { path: '/inTournamentDisplay', view: inTournamentDisplay },
    { path: '/previewTournament', view: previewTournament },
    { path: '/endTournamentDisplay', view: endTournamentDisplay },
    // { path: '/previewTournament/:id', view: previewTournament }
];

export async function navigateTo(path) {
    window.history.pushState({}, path, window.location.origin + path);
    await router();
}

export async function router() {
    const path = window.location.pathname;
    //console.log('ROUTER LOG - Path:', path);
    let route = routes.find(route => {
        const pattern = route.path.replace(/:\w+/g, '\\w+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(path);
    });

	if (path !== lastPath && typeof cleanup === 'function') {
		//console.log("lastPath = ", lastPath);
		cleanup(lastPath);
    }

    const params = extractParams(path, route ? route.path : '');
    const view = route ? route.view : home;

    app.innerHTML = '';
    //console.log(path);
    if (path !== '/') {
        background.style.transition = "transform 1s ease";
        background.style.transform = "scale(3)";
        background.style.transformOrigin = "50% 45%";
    } else {
        background.style.transition = "transform 1s ease";
        background.style.transform = "scale(1)";
    }
    if ((lastPath !== '/' && path === '/') || (lastPath === '/' && path !== '/')) {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Call the view function to get the content for the current path with parameters
    const page = await view(navigateTo, params);


    app.appendChild(page);
    lastPath = path;
}

function extractParams(path, pattern) {
    const keys = [];
    const regex = new RegExp(pattern.replace(/:\w+/g, () => {
        keys.push('id');
        return '(\\w+)';
    }), 'i');
    const matches = path.match(regex);
    if (matches) {
        return keys.reduce((params, key, index) => {
            params[key] = matches[index + 1];
            return params;
        }, {});
    }
    return {};
}

window.addEventListener('load', router);

window.onpopstate = () => {
	router();
}

this.document.addEventListener('click', (event) => {
	if (event.target.matches('[data-link]')) {
		event.preventDefault();
		navigateTo(new URL(event.target.href).pathname);
	}
});

function cleanup(lastPath) {
	// Implement your cleanup logic here
	//console.log('Cleaning up...');
	if (lastPath === "/soloGame")
		stopFleche();
	else if (lastPath === "/iaGame")
		stopFlecheIA();
}
