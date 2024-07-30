import { sendHeartbeat } from '../../tools/tools.js';

// sendHeartbeat();

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

// set the value of the in_tournament global state
async function setInTournament(value) {
    try {
        const response = await fetch('/api/tournaments/global-state/set_in_tournament/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ in_tournament: value.toString() })  // Send 'true' or 'false' as a string
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to set in_tournament state: ${errorText}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(`Error setting in_tournament state: ${data.error}`);
        }

        //console.log('Successfully set in_tournament state.');
    } catch (error) {
        console.error('Error setting in_tournament state:', error);
        throw error;
    }
}

async function sendPostRequest(url, data) {

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        }
    );
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

function addPlayerToList(list, player, listOfPlayer)
{
    if (list.length < 6 && player !== '') {
        list.push(player);
        const li = document.createElement('li');
        li.textContent = player;
        listOfPlayer.appendChild(li);
    }
}

async function createTournamentAPI(tournamentName, players) {
    const response = await fetch('/api/tournaments/tournaments/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tournamentName, players: players }),    });
    if (!response.ok) {
        throw new Error('Failed to create tournament (API issue)');
    }
    return response.json();
}

async function getUsernameAPI(navigateTo) {
    const response = await fetch('/api/auth/getUserInfo/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        }
    });
    if (!response.ok) {
        navigateTo('/');
        throw new Error('Failed to get UserName (API issue refresh token)');
    }
    return response.json();
}

export async function createTournament(navigateTo) {
    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }
    const div = document.createElement('div');
    div.id = 'createTournament';

    // CSS for page createTournament (voir avec Tom si ok ici)
    const styles = `
        #tournamentName {
            margin-bottom: 60px;
            width: 100%;
        }
        .input-container {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        #playerName {
            flex: 1;
            margin-right: 10px;
        }
        #addPlayerButton {
            flex-shrink: 0;
            margin-left: 5px;
        }
        #launchTournamentButton {
            margin-bottom: 40px; // DOES NOT WORK
        }
        .listOfPlayer ul {
            list-style-type: none; // DOES NOT WORK
            padding: 0;
        }
        .listOfPlayer li {
            margin: 40px 0;
        }
        .goBackToHome {
            margin-top: 20px; // DOES NOT WORK
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    div.innerHTML = `
            <h1>Creer un tournoi</h1>
            <div class="tournamentNameClass">
                <input id="tournamentName" type="text" placeholder="Nom du Tournoi">
            </div>
            <div class="addPlayerToTournament">
                <input id="playerName" type="text" placeholder="Nom du Joueur">
                <button id="addPlayerButton" class="homeButtonCss">Ajouter</button>
            </div>
            <div>
                <h2>Liste des joueurs</h2>
                <div class="listOfPlayer">
                    <ul>
                    </ul>
                </div>
            </div>
            <div class="launchTournament">
                <button id="launchTournamentButton" class="homeButtonCss" type="click">Lancer le tournoi</button>
            </div>
            <div class="goBackToHome">
                <button id="goBackToHomeButton" class="homeButtonCss" type="click">Back to Home</button>
            </div>

    `;

    // document.body.appendChild(div); // Ensure the div is added to the DOM first

    const tournamentNameInput = div.querySelector('#tournamentName');
    const playerInput = div.querySelector('#playerName');
    const addPlayerButton = div.querySelector('#addPlayerButton');
    const listOfPlayer = div.querySelector('.listOfPlayer ul');
    const launchTournamentButton = div.querySelector('#launchTournamentButton');
    const goBackToHomeButton = div.querySelector('#goBackToHomeButton');

    // tournamentNameInput.focus();

    let players = [];
    let userName  = '';
    if (await refreshToken() === true)
    {
        //console.log('Access token refreshed');
        const defaultUser = await getUsernameAPI(navigateTo);
        userName = defaultUser.username;
        // if user name length > 10, cut it to 9 and add "." at the end
        if (userName.length > 10)
        {
            userName = userName.substring(0, 9) + ".";
        }
        addPlayerToList(players, userName, listOfPlayer);
    }
    else {
        //console.log('Failed to refresh access token');
        navigateTo('/login');
        return;
    }

    function handleAddPlayer() {
        const name = escapeHTML(playerInput.value);

        // CHECK player name length
        if (name.length > 10) {
            alert('Le nom du joueur ne peut pas dépasser 15 caractères.');
            playerInput.focus();
            return;
        }
        // CHECK player name duplication
        if (players.includes(name)) {
            //console.log('Player already exists!');
            playerInput.focus();
            return;
        }
        // CHECK player name empty or just spaces
        if (name.trim() === '') {
            alert('Le nom du joueur ne peut pas être vide');
            playerInput.focus();
            return;
        }

        addPlayerToList(players, name, listOfPlayer);
        playerInput.value = '';
        playerInput.focus();
    }

    addPlayerButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleAddPlayer();
    });

    playerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddPlayer();
        }
    });

    launchTournamentButton.addEventListener('click', async (event) => {
        // CHECK tournament name
        const tournamentName = escapeHTML(tournamentNameInput.value);
        // check if the tournament name is empty
        if (tournamentName === '') {
            alert('Le nom du tournoi est requis');
            tournamentNameInput.focus();
            return;
        }
        //check if the tournament name is too long
        if (tournamentName.length > 30) {
            alert('Le nom du tournoi ne peut pas dépasser 30 caractères.');
            tournamentNameInput.focus();
            return;
        }
        //check if the tournament name is just spaces
        if (tournamentName.trim() === '') {
            alert('Le nom du tournoi ne peut pas être composé uniquement d\'espaces');
            tournamentNameInput.focus();
            return;
        }

        // CHECK players number
        if (players.length > 2) {
            //console.log('Lancement du tournoi...');
            //we need to set the in_tournament state to true
            //console.log('Setting in_tournament to true...');
            try {
                await setInTournament(true);
                //console.log('LOG - Set in_tournament to true.');
            } catch (error) {
                console.error('Error setting in_tournament state:', error);
            }
            try {
                const tournament = await createTournamentAPI(tournamentName, players);
                //console.log('API successful: Tournament created', tournament);
                if (navigateTo) {
                    // navigateTo('/previewTournament/' + tournament.id);
                    navigateTo('/previewTournament');
                    // navigateTo('/previewTournament');
                }
            } catch (error) {
                console.error('Error creating tournament', error);
                alert('Failed to create tournament');
            }
        } else {
            alert('Il faut au moins 3 joueurs pour lancer un tournoi');
        }
    });

    goBackToHomeButton.addEventListener('click', async (event) => {
        try {
            //console.log('Going back to the home page...');
            if (navigateTo)
                navigateTo('/');
        }
        catch (error) {
            console.error('Error goign back to home page', error);
        }
    });
    return div;
}

