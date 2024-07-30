import { initGame, stopGame } from '../../game/game.js';
import { refreshToken, sendGetRequest } from '../../tools/tools.js';

// function getTournamentIdFromURL() {
//     const path = window.location.pathname;
//     const parts = path.split('/');
//     return parts[parts.length - 1];
// }

// get the value of the in_tournament global state
async function getInTournament() {
    try {
        const response = await fetch('/api/tournaments/global-state/in_tournament/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get in_tournament state: ${errorText}`);
        }

        const data = await response.json();
        return data.in_tournament;
    } catch (error) {
        console.error('Error getting in_tournament state:', error);
        throw error;
    }
}

async function fetchLatestTournament() {
    try {
        const response = await fetch('/api/tournaments/tournaments/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch tournaments: ${errorText}`);
        }

        const tournaments = await response.json();
        if (!tournaments || tournaments.length === 0) {
            throw new Error('No tournaments found');
        }

        // Find the tournament with the latest created_at timestamp
        const latestTournament = tournaments.reduce((latest, tournament) => {
            const currentCreatedAt = new Date(tournament.created_at);
            const latestCreatedAt = new Date(latest.created_at);
            return currentCreatedAt > latestCreatedAt ? tournament : latest;
        });
        //console.log('LAST TOURNAMENT API - Latest tournament:', latestTournament.id);
        return latestTournament.id;

    } catch (error) {
        console.error('Error fetching the latest tournament:', error);
        return null;
    }
}

export async function soloGame(navigateTo) {
    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }
    let inTournament = false;
    // Check if the user is in a tournament
    try {
        const API_inTournament = await getInTournament();
        //console.log('LOG - Current state of in_tournament:', API_inTournament);
        inTournament = API_inTournament;
    } catch (error) {
        console.error('Error fetching in_tournament state:', error);
    }
    let tournamentId = 0;
    if (inTournament) {
        //console.log('LOG - User is in a tournament.');
        const API_tournamentId = await fetchLatestTournament();
        // const tournamentId = getTournamentIdFromURL();
        //console.log('LOG - Tournament ID:', API_tournamentId);
        tournamentId = API_tournamentId;
    }
    else {
        //console.log('LOG - User is not in a tournament.');
        const tournamentId = 0;
    }

    //console.log("BEGINNING OF SOLO GAME");
    //console.log("SOLOGAME - tournamentId is", tournamentId);
    // if (tournamentId > 0)
    //     console.log("SOLOGAME - In a tournament.");
    // else
    //     console.log("SOLOGAME - Not in a tournament.");

    const div = document.createElement('div');
    div.id = 'soloGame';
    div.innerHTML = `
        <div class="gameCanva">
            <canvas id="canvas" width="800" height="600"></canvas>
        </div>
    `;
    div.style.marginTop = '-145px';
    document.getElementById('app').appendChild(div);

	let user_name = await sendGetRequest('/api/auth/getUserInfo');
	user_name = user_name.username;
    //console.log("in soloGame");
    //console.log(div);

    await new Promise(resolve => requestAnimationFrame(resolve));

    if (typeof initGame === 'function') {
        initGame(navigateTo, inTournament, user_name);
    }

    window.cleanup = () => {
        if (typeof stopGame === 'function') {
            //console.log("STOPPING GAME");
            stopGame(navigateTo);
        }
    };

    //console.log("END OF SOLO GAME");
    div.innerHTML = `
        <div class="gameCanva">
            <canvas id="canvas" width="800" height="600"></canvas>
        </div>
    `;
    div.style.marginTop = '-145px';
    document.getElementById('app').appendChild(div);

    //console.log("in soloGame");
    //console.log(div);

    await new Promise(resolve => requestAnimationFrame(resolve));

    if (typeof initGame === 'function') {
        initGame(navigateTo, inTournament, user_name);
    }

    window.cleanup = () => {
        if (typeof stopGame === 'function') {
            //console.log("STOPPING GAME");
            stopGame(navigateTo);
        }
    };

    //console.log("END OF SOLO GAME");

    return div;
}
