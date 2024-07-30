export { init, drawStatic, drawBat, drawScore, updateBat, updateBall, printInfo, printVictory };

const batSound = new Audio('./assets/bruitBat.mp3');
const murSound = new Audio('./assets/bruitMur.mp3');
const pointSound = new Audio('./assets/bruitPoint.mp3');

let waiting = false

function init(scores, bat1, bat2, ball, canvas) {
	scores.score1 = 0;
	scores.score2 = 0;
	bat1.setPosition(20, (canvas.height / 2) - (bat1.height / 2));
	bat2.setPosition(canvas.width - 30, (canvas.height / 2) - (bat1.height / 2));
	ball.setPosition(canvas.width / 2, canvas.height / 2);
}

function drawStatic(ctx, canvas) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	// ctx.fillRect(10, 5, canvas.width - 20, 10);
	// ctx.fillRect(10, canvas.height - 15, canvas.width - 20, 10);

	const x = canvas.width / 2;
	const dashHeight = 10;
	const gapHeight = 10;
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 10;
	ctx.beginPath();
	for (let y = 25; y < canvas.height - 20; y += dashHeight + gapHeight) {
		ctx.moveTo(x, y);
		ctx.lineTo(x, y + dashHeight);
	}
	ctx.stroke();
}


function printVictory(ctx, scores, canvas, inTournament, isIA) {
	if (ctx === null)
		return;
	//console.log("Tournament PRINT VICTORY : ", inTournament);
	// if in turnament = TRUE, return
	if (inTournament) {
		//console.log("NO PRINT CAUZ NOT IN TOURNAMENT = ", inTournament);
		ctx.fillStyle = 'white';
		ctx.font = "9px 'Press Start 2P'";
		ctx.fillText('Game finie ! Appuyer sur q pour quitter ', 200, 400);
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "20px 'Press Start 2P'";
	//console.log(scores.user_name, " ", scores.opponent_name);
	//console.log(scores.score1, " ", scores.score2);
	//console.log(isIA);
	if ((scores.score1 > scores.score2 && !isIA) || (scores.score1 < scores.score2 && isIA)) {
		if (scores.user_name === "")
			ctx.fillText('joueur 1' + " WIN", 200, 350);
		else
			ctx.fillText(scores.user_name + " WIN", 200, 350);
	}
	else {
		if (scores.opponent_name === "")
			ctx.fillText('joueur 2' + " WIN", 200, 350);
		else
			ctx.fillText(scores.opponent_name + " WIN", 200, 350);
	}
	ctx.fillStyle = 'white';
	ctx.font = "9px 'Press Start 2P'";
	ctx.fillText('Appuyer sur q pour quitter ', 200, 400);
	//ctx.fillText('Appuyer sur p pour mettre sur Pause ', 50, 220);
}

function drawBat(bat1, bat2, ctx) {
	bat1.draw(ctx);
	bat2.draw(ctx);
}

function drawScore(score1, score2, ctx, canvas) {
	ctx.font = "50px 'Press Start 2P'";
	if (score1 < 10)
		ctx.strokeText(score1, canvas.width / 2 - 65, 100);
	else if (score1 >= 10 && score1 < 100)
		ctx.strokeText(score1, canvas.width / 2 - (65 + 50), 100);
	else if (score1 >= 100 && score1 < 1000)
		ctx.strokeText(score1, canvas.width / 2 - (65 + 45 + 45), 100);
	else if (score1 >= 1000 && score1 < 10000)
		ctx.strokeText(score1, canvas.width / 2 - (65 + 45 + 45 + 45), 100);
	ctx.strokeText(score2.toString(), canvas.width / 2 + 20, 100);
}

function updateBat(keys, bat1, bat2, canvas) {
	if (keys['w'])
		bat1.y -= bat1.velocite;
	if (keys['s'])
		bat1.y += bat1.velocite;

	if (bat1.y < 0)
		bat1.y = 0;
	if (bat1.y > canvas.height - bat1.height)
		bat1.y = canvas.height - bat1.height;

	if (keys['ArrowUp'])
		bat2.y -= bat2.velocite;
	if (keys['ArrowDown'])
		bat2.y += bat2.velocite;

	if (bat2.y < 0)
		bat2.y = 0;
	if (bat2.y > canvas.height - bat2.height)
		bat2.y = canvas.height - bat2.height;
}

function updateBall(ball, bat1, bat2, scores, canvas) {
	if (waiting) return;

	let steps = Math.ceil(Math.max(Math.abs(ball.vx), Math.abs(ball.vy)));
	let stepX = ball.vx / steps;
	let stepY = ball.vy / steps;

	for (let i = 0; i < steps; i++) {
		let nextX = ball.x + stepX;
		let nextY = ball.y + stepY;

		// Collision avec le haut ou le bas du canvas
		if (nextY > canvas.height - 25 || nextY < 15) {
			//console.log('mur');
			ball.vy = -ball.vy;
			murSound.play();
			stepY = ball.vy / steps;
			nextY = ball.y + stepY;
			//break;
		}

		// Collision avec la raquette gauche
		if (ball.vx < 0 && nextX < bat1.x + bat1.width && nextX > bat1.x && nextY + ball.size >= bat1.y && nextY <= bat1.y + bat1.height) {
			//console.log(`bat1: x: ${ball.x}, y: ${ball.y} ball: x: ${ball.x}, y: ${ball.y}`);
			// ball.vx = -ball.vx;
			// handlePaddleCollision(ball, bat1);
			ball.vy = -ball.vy;
			ball.vx = -ball.vx;
			batSound.play();
			//console.log("bat size = ", bat1.height);
			//si la ball touch la barre 1 on inverse sa trajsctoir pour quelle rebondisse
			let zoneImpacte = bat1.height + ball.size * 2;
			let pointImpacte = ball.y - bat1.y + ball.size;
			//console.log(pointImpacte);
			if (pointImpacte < zoneImpacte / 2) {
				pointImpacte = zoneImpacte / 2 - pointImpacte;
				pointImpacte = -pointImpacte;
			}
			else if (pointImpacte > zoneImpacte / 2)
				pointImpacte = pointImpacte - zoneImpacte / 2;
			else
				pointImpacte = 0;
			//console.log(pointImpacte);
			//console.log("point d impacte >", pointImpacte);

			ball.vy = ball.velocite * (pointImpacte / (zoneImpacte / 2));
			//console.log("vy >", ball.vy);

			break;
		}

		// Collision avec la raquette droite
		if (ball.vx > 0 && nextX > bat2.x - bat2.width && nextX < bat2.x && nextY + ball.size >= bat2.y && nextY <= bat2.y + bat2.height) {
			//console.log(`bat2: x: ${ball.x}, y: ${ball.y} ball: x: ${ball.x}, y: ${ball.y}`);
			// ball.vx = -ball.vx;
			// handlePaddleCollision(ball, bat2);
			ball.vy = -ball.vy;
			ball.vx = -ball.vx;
			batSound.play();
			//console.log("bat size = ", bat2.height);
			//si la ball touch la barre 2 on inverse sa trajsctoir pour quelle rebondisse
			let zoneImpacte = bat2.height + ball.size * 2;
			let pointImpacte = ball.y - bat2.y + ball.size;
			//console.log(pointImpacte);
			if (pointImpacte < zoneImpacte / 2) {
				pointImpacte = zoneImpacte / 2 - pointImpacte;
				pointImpacte = -pointImpacte;
			}
			else if (pointImpacte > zoneImpacte / 2)
				pointImpacte = pointImpacte - zoneImpacte / 2;
			else
				pointImpacte = 0;
			//console.log("point d impacte >", pointImpacte);
			ball.vy = ball.velocite * (pointImpacte / (zoneImpacte / 2));
			//console.log("vy >", ball.vy);

			break;
		}

		ball.x = nextX;
		ball.y = nextY;
	}

	// Vérifier si la balle sort du terrain (gauche ou droite)
	if (ball.x > canvas.width || ball.x < 0) {
		//console.log('point marqué');
		pointSound.play();

		if (ball.x < 0) {
			scores.score2++;
		} else if (ball.x > canvas.width) {
			scores.score1++;
		}

		waiting = true;
		ball.setPosition(canvas.width / 2, canvas.height / 2);
		bat1.setPosition(20, (canvas.height / 2) - (bat1.height / 2));
		bat2.setPosition(canvas.width - 30, (canvas.height / 2) - (bat1.height / 2));

		setTimeout(() => {
			ball.vx = -ball.vx;
			ball.vy = 0;
			waiting = false;
		}, 500);
	}
}

function printInfo(ctx) {
	ctx.fillStyle = 'white';
	ctx.font = "9px 'Press Start 2P'";
	ctx.fillText('Appuyer sur j pour Jouer ', 50, 200);
	ctx.fillText('Appuyer sur p pour mettre sur Pause ', 50, 220);
	ctx.fillText('Appuyer sur q pour quitter ', 50, 240);
	ctx.fillText('joueur 1: ', 50, 360);
	ctx.fillText('Press w pour Monter', 50, 380);
	ctx.fillText('Press s pour Descendre', 50, 400);
	ctx.fillText('joueur 2: ', 450, 360);
	ctx.fillText('Press Fleche du Haut pour Monter', 450, 380);
	ctx.fillText('Press Fleche du Bas pour Descendre', 450, 400);
}

export function renderWall(scene, canvaWidth, canvaHeight) {
	const wallGeometry = new THREE.BoxGeometry(canvaWidth, 20, 20);
	const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const upperWall = new THREE.Mesh(wallGeometry, wallMaterial);
	const lowerWall = new THREE.Mesh(wallGeometry, wallMaterial);
	upperWall.position.set(canvaWidth / 2, 0);
	lowerWall.position.set(canvaWidth / 2, -canvaHeight, 0);

	let wallGroup = new THREE.Group();
	wallGroup.add(upperWall);
	wallGroup.add(lowerWall);
	// scene.add(upperWall);
	// scene.add(lowerWall);
	scene.add(wallGroup);
	return wallGroup;
}
