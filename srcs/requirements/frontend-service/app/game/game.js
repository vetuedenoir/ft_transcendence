import { refreshToken, sendGetRequest, escapeHTML } from '../tools/tools.js';
import { Bat, animateFragments } from './classes.js';
import { Ball } from './classes.js';
import { init, updateBat, updateBall, drawStatic, drawBat, drawScore, printInfo, renderWall , printVictory} from './fonctions.js';

const white = 0xffffff;

let canvasDiv;
let canvas, ctx, scene, camera, renderer, color, colorValue, batSize, ballVelocity, colorDiv, velocityDiv, batSizeDiv;
let keys = {};
let bat1, bat2, ball;
let pause = true;
let buttonActive = false;
let opponentPseudo = "";

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


function initGame(navigateTo, inTournament, user_name) {

    //console.log("in init Game");

    scene = new THREE.Scene();
    let canvaWidth = 800;
    let canvaHeight = 600;

    camera = new THREE.PerspectiveCamera(75, canvaWidth / canvaHeight, 0.1, 1000);
    camera.position.set(canvaWidth / 2, -canvaHeight / 2, 400); // 500 unités de hauteur
    camera.lookAt(new THREE.Vector3(canvaWidth / 2, -canvaHeight / 2, 0)); // Regarder vers le centre du terrain

    canvasDiv = document.querySelector('.gameCanva');

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(canvaWidth, canvaHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    //console.log("renderer", renderer);
    //console.log(canvasDiv);
    canvasDiv.appendChild(renderer.domElement);

    canvas = document.querySelector('canvas');

    ctx = canvas.getContext('2d');
	let scores = { score1: 0, score2: 0, opponent_name: 'Player 2', user_name: user_name};

    if (ctx) {
        //console.log("in ctx", ctx);
		if (refreshToken() === false) {
			navigateTo('/login');
		}
		//console.log("user_name = ", user_name);
		//console.log("opponent_name = ", scores.opponent_name);
		//console.log("score1 = ", scores.score1);
		//console.log("score2 = ", scores.score2);
        keys = {};
        color = white;
        bat1 = new Bat(100, 10, color);
        bat2 = new Bat(100, 10, color);
        ball = new Ball("white", 10);

        scene.add(bat1.mesh);
        scene.add(bat2.mesh);

        document.addEventListener('keydown',handleKeydown);
        document.addEventListener('keyup', handleKeyup);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa2a2a2, 0.8);
        hemiLight.position.set(canvaWidth / 2, -canvaHeight / 2, 500).normalize();
        scene.add(hemiLight);

    	let wallGroup = renderWall(scene, canvaWidth, canvaHeight, color);

        const settingsContainer = document.createElement('div');
        settingsContainer.classList.add('settingsContainer');
        //console.log("BOOLEAN CHECK INTOURNAMENT = ", inTournament);
        const opponentPseudoInput = document.createElement('input');
        if (!inTournament) {
            //console.log("Creating opponent input");
            opponentPseudoInput.type = 'text'    ;
            opponentPseudoInput.placeholder = 'Pseudo de l\'adversaire';
		    opponentPseudoInput.maxLength = '10';
            settingsContainer.appendChild(opponentPseudoInput);
        }

        new Promise((resolve, reject) => {
            colorDiv = document.createElement('div');
            const colorLabel = document.createElement('label');
            colorLabel.textContent = 'Couleur des éléments';
            colorValue = document.createElement('input');
            colorValue.type = 'color';
            colorValue.value = '#ffffff';
            colorValue.addEventListener('change', () => {
                resolve(colorValue.value);
                ball.setColor(colorValue.value);
                bat1.setColor(colorValue.value);
                bat2.setColor(colorValue.value);
                wallGroup.children.forEach(wall => wall.material.color.set(colorValue.value));
                renderer.render(scene, camera);
            });
            colorDiv.appendChild(colorLabel);
            colorDiv.appendChild(colorValue);
            settingsContainer.appendChild(colorDiv);
        });

        new Promise((resolve, reject) => {
            const batSizeLabel = document.createElement('label');
            batSize = document.createElement('input');
            batSize.type = 'range';
            batSize.min = 10;
            batSize.max = 20;
            batSize.value = 10;
            batSize.addEventListener('change', () => {
                resolve(batSize.value);
                //console.log(batSize.value);
                bat1.setSize(batSize.value);
                bat2.setSize(batSize.value);
                renderer.render(scene, camera);
            });
            batSizeLabel.textContent = 'Taille des raquettes';
            batSizeDiv = document.createElement('div');
            batSizeDiv.appendChild(batSizeLabel);
            batSizeDiv.appendChild(batSize);
            settingsContainer.appendChild(batSizeDiv);
        });

        new Promise((resolve, reject) => {
            const velocityLabel = document.createElement('label');
            ballVelocity = document.createElement('input');
            ballVelocity.type = 'range';
            ballVelocity.min = 5;
            ballVelocity.max = 20;
            ballVelocity.value = 10;
            ballVelocity.addEventListener('change', () => {
                resolve(ballVelocity.value);
                //console.log(ballVelocity.value);
                ball.setVelocity(ballVelocity.value);
                renderer.render(scene, camera);
            });
            velocityLabel.textContent = 'Vitesse de la balle';
            velocityDiv = document.createElement('div');
            velocityDiv.appendChild(velocityLabel);
            velocityDiv.appendChild(ballVelocity);
            settingsContainer.appendChild(velocityDiv);
        });


        new Promise((resolve, reject) => {
            const launchButton = document.createElement('button');
            launchButton.textContent = 'Lancer la partie';
            launchButton.classList.add('homeButtonCss');
            launchButton.addEventListener('click', () => {
                resolve();
                if (!inTournament)
                {
                    //console.log("Inside the promise to get the opponent name");
                    //check that exists, not longer than 10 characters and different from the user name
                    if (opponentPseudoInput.value !== "" && opponentPseudoInput.value.length <= 10 && opponentPseudoInput.value !== user_name)
                    {
                        scores.opponent_name = opponentPseudoInput.value;
                        //console.log("opponent name = ", scores.opponent_name);
                    }
				}
                buttonActive = true;
                settingsContainer.removeChild(colorDiv);
                settingsContainer.removeChild(batSizeDiv);
                settingsContainer.removeChild(velocityDiv);
                settingsContainer.removeChild(launchButton);
                if (!inTournament)
                    settingsContainer.removeChild(opponentPseudoInput);
                drawScore(scores.score1, scores.score2, ctx, canvas);
                printInfo(ctx);
                scene.add(ball.mesh);
                renderer.setAnimationLoop(() => gameloop(navigateTo,inTournament, scores));
            });
            settingsContainer.appendChild(launchButton);
        });


        canvasDiv.appendChild(settingsContainer);
        init(scores, bat1, bat2, ball, canvas);
        renderer.render(scene, camera);

    } else {
        console.error('Canvas non supporté');
    }
}

function handleKeydown(e) {
    keys[e.key] = true;
}

function handleKeyup(e) {
    keys[e.key] = false;
}

function gameloop(navigateTo, inTournament, scores) {
    if (!pause && buttonActive) {
        updateBat(keys, bat1, bat2, canvas);
        updateBall(ball, bat1, bat2, scores, canvas);

        bat1.updatePosition(bat1.x, bat1.y);
        bat2.updatePosition(bat2.x, bat2.y);
        ball.updatePosition(ball.x, ball.y);

        drawStatic(ctx, canvas);
        // add function to display players names
        renderer.render(scene, camera);
        drawScore(scores.score1, scores.score2, ctx, canvas);
    }
    if (keys['p'] || keys['P']) {
        printInfo(ctx);
        pause = true;
    }
    if (keys['j'] || keys['J']) {
        pause = false;
    }
    if (scores.score1 === 5 || scores.score2 === 5) {
		printVictory(ctx, scores, canvas, inTournament, false);
        pause = true;
    }
    if (pause === true && (keys['q'] || keys['Q']))
    {
        stopGame(navigateTo, scores);
    }
}


async function stopGame(navigateTo, scores) {
    // pause = true;

    if (renderer) {
        renderer.setAnimationLoop(null);
    }

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', handleKeyup);

    if (bat1) {
        bat1.dispose(scene);
        bat1 = null;
    }
    if (bat2) {
        bat2.dispose(scene);
        bat2 = null;
    }
    if (ball) {
        ball.dispose(scene);
        ball = null;
    }
    if (renderer) {
        renderer.dispose();
        canvasDiv.removeChild(renderer.domElement);
        renderer = null;
    }

    canvas = null;
    ctx = null;
    scene = null;
    camera = null;

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

    if (tournamentId > 0)
    {
        //console.log("[1] in stopGame - TOURNAMENT DETECTED: ", tournamentId);
        endOfGame_tournament(navigateTo, tournamentId, scores);
    }
    else
    {
        //console.log("in stopGame - NO TOURNAMENT DETECTED");
        endOfGame_soloGame(navigateTo, scores);
    }
}



async function endOfGame_tournament(navigateTo, tournamentId, scores) {
    //console.log("[2] endOfGame_tournament - API CALLS");
    //console.log("[3] Scores of the game: ", scores);
    try {
        await sendScoresToTournamentMatchesAPI(tournamentId, scores);
        //console.log("[8.1] END OF GAME - Successfully updated scores, navigating to inTournamentDisplay page");

        // navigateTo('/inTournamentDisplay/' + tournamentId);
        navigateTo('/inTournamentDisplay');
    } catch (error) {
        console.error('Failed to update scores:', error);
        navigateTo('/');
    }
}

// IN TOURNAMENT - end of game function to send the scores to the API
async function sendScoresToTournamentMatchesAPI(tournamentId, scores)
{
    if (!scores || typeof scores.score1 === 'undefined' || typeof scores.score2 === 'undefined') {
        console.error('[3.11] ERROR - Scores object is missing or malformed:', scores);
        return { success: false, error: 'Scores object is missing or malformed' };
    }
    else
    {
        //if one of the score is null, we set it to 0
        if (!scores.score1)
        {
            scores.score1 = 0;
        }
        if (!scores.score2)
        {
            scores.score2 = 0;
        }
        //console.log("[3.12] OK - sendScoresToTournamentMatchesAPI - Scores object: ", scores);
    }
    const score1 = scores.score1;
    //console.log("[3.13] OK - sendScoresToTournamentMatchesAPI - score1: ", score1);
    const score2 = scores.score2;
    //console.log("[3.14] OK - sendScoresToTournamentMatchesAPI - score2: ", score2);
    try
    {
        //get the matches of the tournament
        const matchesData = await fetchMatchesByTournamentAPI(tournamentId);
        //console.log("[4] TOURNAMENT API - matchesData: ", matchesData);

        //find the current match : as they are numeroted with a round number, we can find the current match by
            // ranking the matches by round number and taking the first match that has no winner yet, getting its ID
        const currentMatch = matchesData.sort((a, b) => a.round - b.round).find(match => !match.winner);
        //console.log("[5] TOURNAMENT API - currentMatch: ", currentMatch);
        if (!currentMatch)
        {
            throw new Error('No current match found');
        }
        const currentMatchId = currentMatch.id;
        //console.log("[6] TOURNAMENT API - currentMatchId: ", currentMatchId);

        //send the scores to the API of the current match using its ID
        const response = await fetch(`/api/tournaments/matches/${currentMatchId}/record/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                points_player1: score1,
                points_player2: score2,
                // winner_id: scores.score1 > scores.score2 ? currentMatch.player1.id : currentMatch.player2.id,
            }),
        });
        if (!response.ok) {
            // Handle unsuccessful response
            const errorData = await response.json();
            console.error('[7] TOURNAMENT API - Failed to update scores:', errorData);
            return { success: false, error: errorData };
        }

        const responseData = await response.json();
        //console.log("[7] TOURNAMENT API - updated scores response: ", responseData);
        return { success: true, data: responseData };
    }
    catch (error)
    {
        console.error('[xxx?] ERROR - Error in post game function (API sendScoresToTournamentMatchesAPI):', error);
        return { success: false, error: error.message };
    }

}

//tournament API to get the matches of the current tournamentID
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

    //console.log("[PRE 4] fetchMatchesByTournamentAPI - response: ", response);
    return response.json();
}

export function endOfGame_soloGame(navigateTo, scores) {
    //console.log("endOfGame_soloGame - API CALLS");

	const response = fetch('/api/userman/create_match/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
		},
		body: JSON.stringify({
			user_point: scores.score1,
			opponent_point: scores.score2,
			date : new Date().toISOString().slice(0, 19).replace('T', ' '),
			winner : scores.score1 > scores.score2 ? "WIN" : "LOSE",
			opponent_name : scores.opponent_name,
		}),
	});

    navigateTo('/');
}

function stopFleche() {
    pause = true;
	buttonActive = false;
	//console.log("in stop game");
    if (renderer) {
        renderer.setAnimationLoop(null);
    }

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', handleKeyup);

    if (bat1) {
        bat1.dispose(scene);
        bat1 = null;
    }
    if (bat2) {
        bat2.dispose(scene);
        bat2 = null;
    }
    if (ball) {
        ball.dispose(scene);
        ball = null;
    }
    if (renderer) {
        renderer.dispose();
        canvasDiv.removeChild(renderer.domElement);
        renderer = null;
    }

    canvas = null;
    ctx = null;
    scene = null;
    camera = null;
}


export { initGame, stopGame , stopFleche};


