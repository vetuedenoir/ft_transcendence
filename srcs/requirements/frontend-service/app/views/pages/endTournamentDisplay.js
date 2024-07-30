import { refreshToken } from '../../tools/tools.js';

// ========================== UTILS FUNCTION ==========================

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

// function to collect the infos about the current ID tournament using the API
async function fetchLatestTournamentAPI() {
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

// ========================== MAIN FUNCTION ==========================

export async function endTournamentDisplay(navigateTo) {

    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }

	const div = document.createElement('div');
    div.id = 'endTournamentDisplay';

    //console.log('LOG - START OF FILE END TOURNAMENT DISPLAY');

	// Get the current tournament ID
    const tournamentId = await fetchLatestTournamentAPI();
    //console.log('LOG - Tournament ID:', tournamentId);

	// Get the results of the tournament with the API
	let results = null;
    try
    {
        // use the API to get the results of the tournament
        const response = await fetch(`/api/tournaments/tournaments/${tournamentId}/results/`);
        if (!response.ok) {
            throw new Error('Failed to fetch tournament results');
        }

		// get the results of the tournament
        results = await response.json();

		if (!results || !results.winner || !results.ranking)
		{
			throw new Error('No results found');
		}
	}
	catch (error)
	{
		console.error('Error fetching tournament results:', error);
	}

	// parse the results
	let winner = null;
	let ranking = null;
	if (results)
	{
		winner = results.winner;
		//console.log('LOG - Winner:', winner);
		ranking = results.ranking;
		//console.log('LOG - Ranking:', ranking);
	}
	else
	{
		console.error('No results found');
	}

	// generate the ranking html
	const rankingHTML = ranking.map((player, index) => {
        return `<li>${index + 1}. ${player.player} - <i>Wins: ${player.wins}, Points: ${player.points}</i></li>`;
    }).join('');
	//console.log('LOG - Ranking HTML:', rankingHTML);

	div.innerHTML = `
	<h1>Tournament Results!</h1>
	<p class="blinking blinking-large-large">Winner: ${winner}</p>
	<h2>Ranking:</h2>
	<li>
		${rankingHTML}
	</li>

	<button id="ResetToHomeButton" class="homeButtonCss"><i> Back home </i></button>
`;

	const ResetToHomeButton = div.querySelector('#ResetToHomeButton');

	ResetToHomeButton.addEventListener('click', async (event) => {
		// if going back, we need to set the in_tournament state to false
		try {
			await setInTournament(false);
			//console.log('LOG - Set in_tournament to false.');
		} catch (error) {
			console.error('Error setting in_tournament state:', error);
		}
		try {
			//console.log('Deleting tournament...');
			const deleteTournament = await deleteTournamentAPI(tournamentId);
			//console.log('API successful: Tournament deleted', deleteTournament)
			//console.log('Going back home...');
			if (navigateTo)
				navigateTo('/');
		}
		catch (error) {
			console.error('Error deleting tournament', error);
			alert('Failed to delete tournament');
			navigateTo('/');
		}
	});
	return div;
}
