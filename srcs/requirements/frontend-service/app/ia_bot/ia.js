import { Bat } from '../game/classes.js';
import { Ball } from '../game/classes.js';
import { init, drawStatic, drawScore, renderWall, printVictory} from '../game/fonctions.js';
import { updateBallIa, updateBatRobot, updateBatJoueur, printInfo} from './fonctionIa.js';
import { endOfGame_soloGame } from '../game/game.js';
import { sendGetRequest, refreshToken } from '../tools/tools.js';

const white = 0xffffff;

let canvasDiv;
let canvas, ctx, scene, camera, renderer, color, colorValue, batSize, ballVelocity, colorDiv, velocityDiv, batSizeDiv;
let keys = {};
let bat1, bat2, ball;
let pause = true;
let buttonActive = false;
let impacteBall = {x:0, y:0, distFrameBall:0, distFrameBat:0, nbMouvAleatoir:0, direction:0, mode:0, time:0};

function initGame(navigateTo, user_name) {
	//console.log("in init Game");
	pause = true;
	buttonActive = false;

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
	canvasDiv.appendChild(renderer.domElement);
	let scores = { score1: 0, score2: 0, opponent_name: 'IA', user_name: user_name};

	canvas = document.querySelector('canvas');

    ctx = canvas.getContext('2d');
    if (ctx) {
        keys = {};
		color = white;
        bat1 = new Bat(100, 10, color);
        bat2 = new Bat(100, 10, color);
		if (refreshToken() === false) {
			navigateTo('/login');
		}
		//console.log("user_name = ", user_name);
        ball = new Ball("white", 10);
        init(scores, bat1, bat2, ball, canvas);
		impacteBall = {x: bat1.x + bat1.width, y: bat1.y + (bat1.height / 2), distFrameBall:0, distFrameBat:0, nbMouvAleatoir:0, direction:0, mode:0, time: Date.now()};
        // drawStatic(ctx, canvas);
        // drawScore(scores.score1, scores.score2, ctx, canvas);
        // printInfo(ctx);

		scene.add(bat1.mesh);
		scene.add(bat2.mesh);

        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa2a2a2, 0.8); // Lumière hémisphérique
        hemiLight.position.set(canvaWidth / 2, -canvaHeight / 2, 500).normalize(); // Positionner la lumière au-dessus
        scene.add(hemiLight);

		let wallGroup = renderWall(scene, canvaWidth, canvaHeight, color);

        const settingsContainer = document.createElement('div');
        settingsContainer.classList.add('settingsContainer');

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
				bat1.setVelocity(ballVelocity.value - 2);
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
                buttonActive = true;
                settingsContainer.removeChild(colorDiv);
                settingsContainer.removeChild(batSizeDiv);
                settingsContainer.removeChild(velocityDiv);
                settingsContainer.removeChild(launchButton);
                drawScore(scores.score1, scores.score2, ctx, canvas);
                printInfo(ctx);
                scene.add(ball.mesh);
				//console.log("ball x = ", ball.x,  " ball y = ", ball.y," ball vx = ", ball.vx, " ball vy = ", ball.vy,);
                renderer.setAnimationLoop(() => gameloop(navigateTo, scores));
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

function gameloop(navigateTo, scores)
{
	if (!pause && buttonActive)
	{
		//console.log("ball x = ", ball.x,  " ball y = ", ball.y," ball vx = ", ball.vx, " ball vy = ", ball.vy,);

		//console.log("b act" , buttonActive);
		updateBatRobot(impacteBall, bat1, canvas);
		updateBatJoueur(keys, bat2, canvas);
		updateBallIa(ball, bat1, bat2, scores, impacteBall, canvas);

		bat1.updatePosition(bat1.x, bat1.y);
		bat2.updatePosition(bat2.x, bat2.y);
		ball.updatePosition(ball.x, ball.y);

		drawStatic(ctx, canvas);
		renderer.render(scene, camera);
		drawScore(scores.score1, scores.score2, ctx, canvas);
	}
	if (keys['p'])
	{
		pause = true;
		//console.log("en pause");
		printInfo(ctx);
	}
	if (keys['j'])
		pause = false;
	if (scores.score1 === 5 || scores.score2 === 5) // on peut changer la condition d arret
	{
		pause = true;
		buttonActive = false;
		pause = true;
		printVictory(ctx, scores, canvas, false, true);
	}
	if (pause === true && keys['q'])
	{
		stopGame(navigateTo, scores);
	}
	// animationFrameId = requestAnimationFrame(gameloop);
}

function stopGame(navigateTo, scores) {
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
	endOfIA(navigateTo, scores);
}

function endOfIA(navigateTo, scores) {
	//console.log("endOfIA- API CALLS");
	const scoreia = scores.score1;
	scores.score1 = scores.score2;
	scores.score2 = scoreia;
	endOfGame_soloGame(navigateTo, scores);
}

function stopFlecheIA() {
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

export { initGame, stopGame, stopFlecheIA};
