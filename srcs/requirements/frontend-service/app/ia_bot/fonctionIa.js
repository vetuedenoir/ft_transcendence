export {updateBallIa, updateBatRobot, updateBatJoueur, printInfo};

const batSound = new Audio('./assets/bruitBat.mp3');
const murSound = new Audio('./assets/bruitMur.mp3');
const pointSound = new Audio('./assets/bruitPoint.mp3');

let waiting = false;

// function updateBallIa(ball, bat1, bat2, scores, impacteBall, canvas) //original
// {
// 	if(typeof(ball.vx) != 'number')
// 		ball.vx = parseFloat(ball.vx);
// 	if (waiting) return;

// 	if (ball.y + ball.vy > canvas.height - 25 || ball.y + ball.vy < 15) {
// 		ball.vy = -ball.vy;
// 		murSound.play();
// 	}
// 	if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
// 		pointSound.play();
// 		bat1.setPosition(20, (canvas.height / 2) - (bat1.height / 2));
// 		bat2.setPosition(canvas.width - 30, (canvas.height / 2) - (bat1.height / 2));
// 		if (ball.x + ball.vx < 0)
// 			scores.score2++;
// 		else if (ball.x + ball.vx > canvas.width){
// 			scores.score1++;
// 			impacteBall.y = canvas.height / 2;
// 			impacteBall.mode = 1;
// 			impacteBall.distFrameBall = ((canvas.width / 2) - (bat1.x + bat1.width)) / ball.velocite;
// 		}
// 		ball.setPosition(canvas.width / 2, canvas.height / 2);
// 		waiting = true;
// 		if (waiting)
// 			//console.log("waiting = true");

// 		setTimeout(() => {
// 			ball.vx = -ball.vx;
// 			ball.vy = 0;
// 			waiting = false;
// 		}, 500);
// 		return ;
// 		// ball.vx = -ball.vx;
// 		// ball.vy = 0;
// 	}
// 	if (ball.x === bat1.x + bat1.width && (ball.y + ball.size >= bat1.y && ball.y <= bat1.y + bat1.height)) {
// 		ball.vy = -ball.vy;
// 		ball.vx = -ball.vx;
// 		batSound.play();
// 		let zoneImpacte = bat1.height + ball.size * 2;
// 		let pointImpacte =  ball.y - bat1.y + ball.size;
// 		if (pointImpacte < zoneImpacte / 2){
// 			pointImpacte = zoneImpacte / 2 - pointImpacte;
// 			pointImpacte = -pointImpacte;
// 		}
// 		else if (pointImpacte > zoneImpacte / 2)
// 			pointImpacte = pointImpacte - zoneImpacte / 2;
// 		else
// 			pointImpacte = 0;
// 		ball.vy = ball.velocite * (pointImpacte / 50);
// 	}
// 	if (ball.x === bat2.x - bat2.width && (ball.y + ball.size >= bat2.y && ball.y <= bat2.y + bat2.height)) {
// 		ball.vy = -ball.vy;
// 		ball.vx = -ball.vx;
// 		batSound.play();
// 		let zoneImpacte = bat2.height + ball.size * 2;
// 		let pointImpacte =  ball.y - bat2.y + ball.size;
// 		if (pointImpacte < zoneImpacte / 2){
// 			pointImpacte = zoneImpacte / 2 - pointImpacte;
// 			pointImpacte = -pointImpacte;
// 		}
// 		else if (pointImpacte > zoneImpacte / 2)
// 			pointImpacte = pointImpacte - zoneImpacte / 2;
// 		else
// 			pointImpacte = 0;
// 		ball.vy = ball.velocite * (pointImpacte / 50);
// 		ball.x += ball.vx;
// 		ball.y += ball.vy;

// 		if (Date.now() - impacteBall.time < 1000)
// 			return ; //1000 miliseconde soit 1 seconde
// 		else
// 		{
// 			impacteBall.time = Date.now();
// 			return (robotView(ball, impacteBall, bat1, canvas));
// 		}
// 	}
// 	if (ball.x + ball.vx < bat1.x + bat1.width && (ball.y + ball.vy + ball.size >= bat1.y && ball.y + ball.vy <= bat1.y + bat1.height)){
// 		if (ball.x > bat1.x + bat1.width){
// 			let distancex = ball.x - (bat1.x + bat1.width);
// 			let proportion = distancex / ball.vx;
// 			ball.x = bat1.x + bat1.width;
// 			ball.y += ball.vy * proportion;
// 			return ;
// 		}
// 	}
// 	if (ball.x + ball.vx > bat2.x && (ball.y + ball.vy + ball.size >= bat2.y && ball.y + ball.vy <= bat2.y + bat2.height)){
// 		if (ball.x < bat2.x){
// 			let distancex = bat2.x - (ball.x + ball.size);
// 			let proportion = distancex / ball.vx;
// 			ball.x = bat2.x - bat2.width;
// 			ball.y += ball.vy * proportion;
// 			return ;
// 		}
// 	}
// 	ball.x += ball.vx;
// 	ball.y += ball.vy;
// }

function updateBallIa(ball, bat1, bat2, scores, impacteBall, canvas)
{
	if(typeof(ball.vx) != 'number')
		ball.vx = parseFloat(ball.vx);
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
		let pointImpacte =  ball.y - bat1.y + ball.size;
		//console.log(pointImpacte);
		if (pointImpacte < zoneImpacte / 2)
		{
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
			let pointImpacte =  ball.y - bat2.y + ball.size;
			//console.log(pointImpacte);
			if (pointImpacte < zoneImpacte / 2)
			{
				pointImpacte = zoneImpacte / 2 - pointImpacte;
				pointImpacte = -pointImpacte;
			}
			else if (pointImpacte > zoneImpacte / 2)
				pointImpacte = pointImpacte - zoneImpacte / 2;
			else
				pointImpacte = 0;
			ball.vy = ball.velocite * (pointImpacte / (zoneImpacte / 2));
			if (Date.now() - impacteBall.time < 1000)
				return ; //1000 miliseconde soit 1 seconde
			else
			{
				impacteBall.time = Date.now();
				return (robotView(ball, impacteBall, bat1, canvas));
			}

			break;
		}

		ball.x = nextX;
		ball.y = nextY;
	}

	// Vérifier si la balle sort du terrain (gauche ou droite)
	if (ball.x > canvas.width || ball.x < 0) {
		//console.log('point marqué');
		pointSound.play();
		bat1.setPosition(20, (canvas.height / 2) - (bat1.height / 2));
		bat2.setPosition(canvas.width - 30, (canvas.height / 2) - (bat1.height / 2));

		if (ball.x < 0) {
			scores.score2++;
		} else if (ball.x > canvas.width) {
			scores.score1++;
			impacteBall.y = canvas.height / 2;
			impacteBall.mode = 1;
			impacteBall.distFrameBall = ((canvas.width / 2) - (bat1.x + bat1.width)) / ball.velocite;
		}

		ball.setPosition(canvas.width / 2, canvas.height / 2);
		waiting = true;

		setTimeout(() => {
			ball.vx = -ball.vx;
			ball.vy = 0;
			waiting = false;
		}, 500);
		return ;
	}
}

function updateBatJoueur(keys, bat2, canvas)
{
	if (keys['ArrowUp'])
		bat2.y -= bat2.velocite;
	if (keys['ArrowDown'])
		bat2.y += bat2.velocite;

	if (bat2.y < 0)
		bat2.y = 0;
	if (bat2.y > canvas.height - bat2.height)
		bat2.y = canvas.height - bat2.height;
}

function robotView(ball, coordone, bat1, canvas)
{
	const limiteHaute = 25;
	const limiteBas = canvas.height - 15;
	const limiteDroite = bat1.x + bat1.width;
	let nbFrameAvContacte;
	let nbFrameAvInversion;
	coordone.mode = 1;

	if (ball.vx < 0)
	{
		let nbPixAParcourirX = ball.x - limiteDroite;
		nbFrameAvContacte = nbPixAParcourirX / Math.abs(ball.vx);
		coordone.distFrameBall = nbFrameAvContacte;
		//console.log("nbframe avant contacte = ", nbFrameAvContacte);
		//console.log('vy = ' , ball.vy);
		let nbPixAParcourirY;
		if (ball.vy === 0) {
			coordone.y = ball.y;
			coordone.x = limiteDroite;
			return ;
		}
		else if (ball.vy < 0){
			nbPixAParcourirY = ball.y - limiteHaute;
			//console.log('je monte, ball.y = ', ball.y, ' et lim Haute = ', limiteHaute);
		}
		else {
			nbPixAParcourirY = limiteBas - ball.y;
			//console.log('je descend, ball.y = ', ball.y, ' et lim bas = ', limiteBas);
		}
		//console.log('nbPixAParcourirY = ', nbPixAParcourirY);
		//console.log('abs de vall.vy = ', Math.abs(ball.vy));
		nbFrameAvInversion = nbPixAParcourirY / Math.abs(ball.vy);
		//console.log('nbFrame avant inversion = ', nbFrameAvInversion);
		if (nbFrameAvInversion > nbFrameAvContacte)
			nbFrameAvInversion = nbFrameAvContacte;
		let tmpY = ball.y + (nbFrameAvInversion * ball.vy); //ici est determiner a quelle hauteur la balle aterie si elle ne rebondi pas
		let tmpVY = ball.vy;
		let tmpNbFrAvInv = 0;
		while (nbFrameAvInversion != nbFrameAvContacte) {
			tmpVY = -tmpVY;
			nbPixAParcourirY = limiteBas - limiteHaute;
			tmpNbFrAvInv = nbPixAParcourirY / Math.abs(tmpVY);
			if (tmpNbFrAvInv + nbFrameAvInversion > nbFrameAvContacte)
				tmpNbFrAvInv = nbFrameAvContacte - nbFrameAvInversion;
			nbFrameAvInversion += tmpNbFrAvInv;
			tmpY = tmpY + (tmpNbFrAvInv * tmpVY);
		}
		coordone.y = tmpY;
		coordone.x = limiteDroite;
	}
	else {
		coordone.distFrameBall = ((canvas.width - ball.x) + canvas.width - (limiteDroite * 2)) / Math.abs(ball.vx);
		coordone.y = canvas.height / 2;
		coordone.x = limiteDroite;
	}
	//console.log('coordone y = ', coordone.y);
	//console.log('coordone x = ', coordone.x);
}


function newDirectionAleatoir(coordone)
{
	coordone.nbMouvAleatoir = Math.floor(Math.random() * 30 ) + 30;
	coordone.direction  = Math.floor(Math.random() * 5) + 1; // 1 et 2 on monte, 3 on bouge pas, 4 et 6 on descend;
}

function makeMouvAleatoir(coordone, bat1, canvas)
{
	if (coordone.direction < 3) // on monte
	{
		if (bat1.y > 0)
			bat1.y -= bat1.velocite;
		else
			coordone.direction = 4;
		if (coordone.mode === 2 && coordone.y > bat1.y + (bat1.height / 2))
			coordone.distFrameBat++;
		else
			coordone.distFrameBat--;
	}
	else if (coordone.direction > 3) // on descend
	{
		if (bat1.y + bat1.height < canvas.height)
			bat1.y += bat1.velocite;
		else
		coordone.direction = 2;
		if (coordone.mode === 2 && coordone.y < bat1.y + (bat1.height / 2))
			coordone.distFrameBat++;
		else
			coordone.distFrameBat--;

	}
	coordone.nbMouvAleatoir--;
}

function updateBatRobot(coordone, bat1, canvas)
{
	//console.log("ok")
	if (waiting === true)
		return;
	//premier service et apres avoir renvoyer la ball, tout est a zero donc on fais des mouv aleatoir
	if (coordone.mode === 0 && coordone.distFrameBall === 0) {
		if (coordone.nbMouvAleatoir === 0)
			newDirectionAleatoir(coordone);
		else
			makeMouvAleatoir(coordone, bat1, canvas);
	}
	else if (coordone.distFrameBall > 0 && coordone.mode === 1) // je viens de reperer la ball
	{
		//console.log("interception de la ball par le joueur");
		if (coordone.y > bat1.y + (bat1.height / 2))
			coordone.distFrameBat = (coordone.y - bat1.y + (bat1.height / 2)) / bat1.velocite;
		else
			coordone.distFrameBat = (bat1.y + (bat1.height / 2) - coordone.y ) / bat1.velocite;
		if (coordone.distFrameBall > coordone.distFrameBat)
			coordone.mode = 2; //mode aleatoir on l on decremente distFrameBall
		else
			coordone.mode = 3; //mode interception
		coordone.distFrameBall--;
	}
	else if (coordone.mode === 2) //mouvement aleatoir qui doivent etre controler
	{
		coordone.distFrameBall--;
		if (coordone.distFrameBall <= coordone.distFrameBat) {
			coordone.mode = 3;
			coordone.nbMouvAleatoir = 0;
			return ;
		}
		if (coordone.nbMouvAleatoir === 0)
		{
			newDirectionAleatoir(coordone);
			if (coordone.nbMouvAleatoir > coordone.distFrameBat)
				coordone.nbMouvAleatoir = Math.floor(coordone.distFrameBat);
		}
		else
			makeMouvAleatoir(coordone, bat1, canvas);
	}
	else if (coordone.mode === 3) // j intercepte la ball
	{
		let random = coordone.nbMouvAleatoir = Math.floor(Math.random() * 100 ) + 1;
		if (random === 50) {
			coordone.mode = 4;
			coordone.distFrameBall--;
		}

		if (coordone.y > bat1.y + (bat1.height / 2) + 10)
			bat1.y += bat1.velocite;
		else if (coordone.y < bat1.y + (bat1.height / 2) + 10)
			bat1.y -= bat1.velocite;
		coordone.distFrameBall--;
		if (coordone.distFrameBall < 1)
		{	coordone.mode = 0;
			coordone.distFrameBall = 0;
		} // on revient au mode aleatoir primaire
	}
	else if (coordone.mode === 4)
	{
		//console.log("dans le hasard de la gagne, ", coordone.distFrameBall);
		if (coordone.nbMouvAleatoir === 0)
		{
			newDirectionAleatoir(coordone);
			if (coordone.nbMouvAleatoir > coordone.distFrameBall)
				coordone.nbMouvAleatoir = Math.floor(coordone.distFrameBall);
		}
		else
			makeMouvAleatoir(coordone, bat1, canvas);
		if (coordone.distFrameBall < 1){
			coordone.mode = 0;
			coordone.distFrameBall = 0;
			coordone.nbMouvAleatoir = 0;
		}
	}
}

function printInfo (ctx)
{
	ctx.fillStyle = 'white';
	ctx.font = "9px 'Press Start 2P'";
	ctx.fillText('Appuyer sur j pour Jouer ', 50, 200);
	ctx.fillText('Appuyer sur p pour mettre sur Pause ', 50, 220);
	ctx.fillText('THE BOT ', 50, 360);
	ctx.fillText('YOU: ', 450, 360);
	ctx.fillText('Press Fleche du Haut pour Monter', 450, 380);
	ctx.fillText('Press Fleche du Bas pour Descendre', 450, 400);
}
