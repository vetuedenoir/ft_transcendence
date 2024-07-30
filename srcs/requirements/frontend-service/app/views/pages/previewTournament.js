// set the value of the in_tournament global state

import { refreshToken } from '../../tools/tools.js';

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

async function fetchTournamentAPI(tournamentId) {
    const response = await fetch(`/api/tournaments/tournaments/${tournamentId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tournament (API error): ${errorText}`);
    }

    return response.json();
}

async function fetchMatchesByTournamentAPI(tournamentId) {
    const response = await fetch(`/api/tournaments/matches/tournament/${tournamentId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch matches (API error): ${errorText}`);
    }

    return response.json();
}

async function deleteTournamentAPI(tournamentId) {
    const response = await fetch(`/api/tournaments/tournaments/${tournamentId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete tournament: ${errorText}`);
    }


}

// ========== MAIN FUNCTION ==========

// Function to create the previewTournament view
export async function previewTournament(navigateTo) {

    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }

    const div = document.createElement('div');
    div.id = 'previewTournament';

    const styles = `
        div {
            text-align: center;
        }
        h1, h2, p {
            text-align: center;
        }
        .matches-list {
            align-items: left;
            justify-items: left;
            margin: 0 auto;
            max-width: 600px;
            padding: 0;
            list-style-type: none;
        }
        .matches-list li {
            padding: 5px 0;
        }
        #startTournamentButton {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #startTournamentButton:hover {
            background-color: #0056b3;
        }
    `;

const styleElement = document.createElement('style');
styleElement.textContent = styles;

	// get the last tournament created ID
	const tournamentId = await fetchLatestTournament();

    try {
        const tournamentData = await fetchTournamentAPI(tournamentId);

        const matchesData = await fetchMatchesByTournamentAPI(tournamentId);

        div.innerHTML = `
                <h1>Preview Tournament</h1>
                <p>Name: ${tournamentData.name}</p>
                <ul class="matches-list">
                    ${matchesData.map(match => `<li>Match ${match.round} - ${match.player1.name} vs ${match.player2.name}</li>`).join('')}
                </ul>
                <button id="startTournamentButton" class="homeButtonCss">Start Tournament</button>
                <button id="goBackToCreateTournament" class="homeButtonCss">Previous Page</button>
        `;
		const startTournamentButton = div.querySelector('#startTournamentButton');
        startTournamentButton.addEventListener('click', () => {
            //console.log('Starting the tournament...');
            if (navigateTo)
                navigateTo('/soloGame');
		});

        const goBackToCreateTournament = div.querySelector('#goBackToCreateTournament');
        goBackToCreateTournament.addEventListener('click', async (event) => {
            // if going back, we need to set the in_tournament state to false
            //console.log('Setting in_tournament to false...');
            try {
                await setInTournament(false);
                //console.log('LOG - Set in_tournament to false.');
            } catch (error) {
                console.error('Error setting in_tournament state:', error);
            }
            //if going back, we need to delete the already created tournament, by using the API
            try {
                //console.log('Going back to the tournament creation page...');
                const deleteTournament = await deleteTournamentAPI(tournamentId);
                //console.log('API successful: Tournament deleted', deleteTournament)
                if (navigateTo)
                    navigateTo('/createTournament');
            }
            catch (error) {
                console.error('Error deleting tournament', error);
                alert('Failed to delete tournament');
            }
		});

    } catch (error) {
        div.innerHTML = '<p>Failed to load tournament details.</p>';
        console.error('Error fetching tournament data:', error);
    }

    return div;
}
