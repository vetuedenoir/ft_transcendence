import { refreshToken } from '../../tools/tools.js';

// ========================== UTILS FUNCTIONS ==========================

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

// function to collect the infos about the current ID tournament using the API
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

// function to delete the current ID tournament using the API
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

// 2. Fetch matches data for the current tournament
    // function to collect the matches of the current ID tournament using the API
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

// ========================== DISPLAY FUNCTIONS ==========================


// 3. Check if the tournament is over
    // function to check if the tournament is over => return true if YES and false if NO
async function checkTournamentIsOver(matchesData) {
    const allMatchesCompleted = matchesData.every(match => match.winner !== undefined && match.winner !== null);
    // const allMatchesCompleted = matchesData.every((match => match.points_player1 > 0 || match.points_player2 > 0) && match.winner);

    if (allMatchesCompleted)
    {
        //console.log('Tournament is over, determining winner and displaying scores...');
        return true; // Indicates that the tournament is over
    }

    //console.log('Tournament is not over yet, displaying StillGoingHTML...');
    return false; // Indicates that the tournament is not over
}

// number of matches regarding the number of players:
    // 3 players => 3 matches
    // 4 players => 6 matches
    // 5 players => 10 matches
    // 6 players => 15 matches
    // max to display => 8 matches
function create_mathPlayedList(matchesData, total_number_of_matches) {
    const matchesPlayed = matchesData.filter(match => match.winner !== undefined && match.winner !== null);
    return matchesPlayed;
}

function create_mathNotPlayedList(matchesData, total_number_of_matches) {
    const matchesNotPlayed = matchesData.filter(match => !(match.winner !== undefined && match.winner !== null));
    return matchesNotPlayed;
}

// FLOW:
// 1. Get tournament ID from URL
// 2. Fetch matches data for the current tournament
// 3. Check if the tournament is over
    // a. If yes, display the tournament results
    // b. If no, display the still ongoing HTML
// 4. Button to start the next match
// 5. Button to go back to home page


// ========================== MAIN FUNCTION ==========================

// 0. Display the tournament page
export async function inTournamentDisplay(navigateTo) {

    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }

    const div = document.createElement('div');
    div.id = 'inTournamentDisplay';

    //console.log('LOG - START OF FILE IN TOURNAMENT DISPLAY');

    // 1. Get tournament ID from URL
    const tournamentId = await fetchLatestTournament();
    //console.log('LOG - Tournament ID:', tournamentId);

    try {
        // 2. Fetch matches data for the current tournament
        const matchesData = await fetchMatchesByTournamentAPI(tournamentId);
        //console.log('LOG - Matches Data:', matchesData);

        // 3. Check if the tournament is over
        if (await checkTournamentIsOver(matchesData))
        {
            // 3a. If yes, navigate to endTournamentDisplay.js
            //console.log('Tournament is over, moving to endTournamentDisplay.js...');
            if (navigateTo)
                navigateTo(`/endTournamentDisplay`);
            // await displayTournamentResults(tournamentId, navigateTo);
        }
        // 3b. If no, display the still ongoing HTML
        else
        {   let total_number_of_matches = matchesData.length;
            let list_matchesPlayed = create_mathPlayedList(matchesData, total_number_of_matches);
            let nb_played = list_matchesPlayed.length;
            //console.log('LOG - Number of matches played:', nb_played);
            let list_matchesNotPlayed = create_mathNotPlayedList(matchesData, total_number_of_matches);
            let nb_not_played = list_matchesNotPlayed.length;
            //console.log('LOG - Number of matches not played:', nb_not_played);
            // isolate the next match to be played
            let nextMatch = list_matchesNotPlayed[0];
            // remove it from the list of the matches not played
            list_matchesNotPlayed = list_matchesNotPlayed.slice(1);

            //console.log('Tournament is not over yet, displaying StillGoingHTML...');
            // Prepare still ongoing HTML
            div.innerHTML = `
            <h1>Tournament Still Ongoing</h1>
            <h2>Matches Played: ${nb_played} / ${total_number_of_matches}</h2>

            <div class="scroll-container" >
                <div class="scroll-content" >
                    <ul class="matches-list">
                        ${list_matchesPlayed.map(match =>
                            `<li>Match ${match.round}: ${match.player1.name} vs ${match.player2.name} (${match.points_player1} - ${match.points_player2})</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>

            <h2>Upcoming Matches:</h2>
            <p class="blinking blinking-large">Match ${nextMatch.round}: ${nextMatch.player1.name} vs ${nextMatch.player2.name}</p>

            <button id="startNextMatchButton" class="homeButtonCss">Start Next Match</button>
            <button id="giveUpHomeButton" class="homeButtonCss">Give up <br><i> Back home </i></button>
        `;


            // 4. Button to start the next match
            const startNextMatchButton = div.querySelector('#startNextMatchButton');
            startNextMatchButton.addEventListener('click', () => {
                //console.log('Starting the next match...');
                // Call the game function to start the next match
                navigateTo(`/soloGame`);
            });

            // 5. Button to go back to home page
            const giveUpHomeButton = div.querySelector('#giveUpHomeButton');
            giveUpHomeButton.addEventListener('click', async (event) => {
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
        }
    } catch (error) {
        div.innerHTML = '<p>Failed to load tournament details.</p>';
        console.error('Error fetching tournament data:', error);
    }

    return div;
}
