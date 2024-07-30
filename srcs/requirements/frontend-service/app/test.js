Pour ajouter une surcouche utilisant Three.js à ton jeu de Pong existant, tu peux remplacer le rendu des raquettes et de la balle par des objets 3D tout en conservant la logique de jeu actuelle. Voici un guide étape par étape pour intégrer Three.js :

1. Installer Three.js
Si tu utilises un fichier HTML, ajoute le script Three.js :

html
Copy code
<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>
2. Initialiser Three.js
Ajoute les éléments de base de Three.js : la scène, la caméra et le rendu.

javascript
Copy code
let scene, camera, renderer, bat1Mesh, bat2Mesh, ballMesh;

function initThreeJS() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);
}
3. Créer les objets 3D pour les raquettes et la balle
Remplace les méthodes draw dans tes classes Bat et Ball pour créer et mettre à jour les objets 3D.

javascript
Copy code
class Bat {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.velocite = 7;
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.mesh.position.set(x, y, 0);
    }

    updatePosition() {
        this.mesh.position.set(this.x, this.y, 0);
    }
}

class Ball {
    constructor(color, size) {
        this.color = color;
        this.size = size;
        this.velocite = 10;
        this.vx = this.velocite;
        this.vy = 0;
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.mesh.position.set(x, y, 0);
    }

    updatePosition() {
        this.mesh.position.set(this.x, this.y, 0);
    }
}
4. Mettre à jour la boucle de jeu
Dans la boucle de jeu, mets à jour les positions des objets 3D après avoir calculé les nouvelles positions.

javascript
Copy code
function gameloop() {
    if (pause != true) {
        updateBat(keys, bat1, bat2);
        updateBall(ball, bat1, bat2, scores);
        drawStatic();
        drawBat(bat1, bat2);
        drawScore(scores.score1, scores.score2);
        ball.draw();

        bat1.updatePosition();
        bat2.updatePosition();
        ball.updatePosition();
    }
    if (keys['p']) {    
        pause = true;
        //console.log("en pause");
        printInfo();
    }    
    if (keys['j'])
        pause = false;
    if (scores.score1 + scores.score2 === 20) {    
        init(scores, bat1, bat2, ball, canvas);
        drawStatic();
        drawBat(bat1, bat2);
        drawScore(scores.score1, scores.score2);
        printInfo();
        pause = true;
    }
    renderer.render(scene, camera); // Render the scene using Three.js
    requestAnimationFrame(gameloop);
}
5. Initialiser Three.js et démarrer la boucle de jeu
Appelle la fonction initThreeJS avant de démarrer la boucle de jeu.

javascript
Copy code
initThreeJS();
gameloop();
Code complet
javascript
Copy code
class Bat {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.velocite = 7;
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.mesh.position.set(x, y, 0);
    }

    updatePosition() {
        this.mesh.position.set(this.x, this.y, 0);
    }
}

class Ball {
    constructor(color, size) {
        this.color = color;
        this.size = size;
        this.velocite = 10;
        this.vx = this.velocite;
        this.vy = 0;
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.mesh.position.set(x, y, 0);
    }

    updatePosition() {
        this.mesh.position.set(this.x, this.y, 0);
    }
}

let canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

if (ctx) {
    let pause = true;
    let keys = {};
    let bat1 = new Bat(100, 10);
    let bat2 = new Bat(100, 10);
    let scores = { score1: 0, score2: 0 };
    let ball = new Ball("white", 10);

    init(scores, bat1, bat2, ball, canvas);
    drawStatic();
    drawBat(bat1, bat2); 
    drawScore(scores.score1, scores.score2);
    printInfo();

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function initThreeJS() {
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 500;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff); // soft white light
        scene.add(light);
    }

    function gameloop() {
        if (pause != true) {
            updateBat(keys, bat1, bat2);
            updateBall(ball, bat1, bat2, scores);
            drawStatic();
            drawBat(bat1, bat2);
            drawScore(scores.score1, scores.score2);
            ball.draw();

            bat1.updatePosition();
            bat2.updatePosition();
            ball.updatePosition();
        }
        if (keys['p']) {    
            pause = true;
            //console.log("en pause");
            printInfo();
        }    
        if (keys['j'])
            pause = false;
        if (scores.score1 + scores.score2 === 20) {    
            init(scores, bat1, bat2, ball, canvas);
            drawStatic();
            drawBat(bat1, bat2);
            drawScore(scores.score1, scores.score2);
            printInfo();
            pause = true;
        }
        renderer.render(scene, camera); // Render the scene using Three.js
        requestAnimationFrame(gameloop);
    }

    initThreeJS();
    gameloop();
} else {
    console.error('Canvas non supporté');
}

const batSound = new Audio('assets/bruitBat.mp3');
const murSound = new Audio('assets/bruitMur.mp3');
const pointSound = new Audio('assets/bruitPoint.mp3');

function init(scores, bat1, bat2, ball, canvas) {
    scores.score1 = 0;
    scores.score2 = 0;
    bat1.setPosition(20, (canvas.height / 2) - (bat1.height / 2));
    bat2.setPosition(canvas.width - 30, (canvas.height / 2) - (bat1.height / 2));
    ball.setPosition(canvas.width / 2, canvas.height / 2); 
}

function drawStatic() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';    
    ctx.fillRect(10, 5, canvas.width - 20, 10);
    ctx.fillRect(10, canvas.height - 15, canvas.width - 20, 10);
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

function drawBat(bat1, bat2) {
    bat1.draw();
    bat2.draw();
}

function drawScore(score1, score2) {
    ctx.font = "80px 'Press Start 2P'";
    if (score1 < 10)
        ctx.strokeText(score1, canvas.width / 2 - 65 , 100);
    else if (score1 >= 10 && score1 < 100)
        ctx.strokeText(score1, canvas.width / 2 - (65 + 50) , 100);
    else if (score1 >= 100 && score1 < 1000)
        ctx.strokeText(score1, canvas.width / 2 - (65 + 45 + 45) , 100);
    else if (score1 >= 1000 && score1 < 10000)
        ctx.strokeText(score1, canvas.width / 2 - (65 + 45 + 45 + 45) , 100);
    ctx.strokeText(score2.toString(), canvas.width / 2 + 20 , 100);
}

function updateBat(keys, bat1, bat2) {
    if (keys['w'])
        bat1.y -= bat1.velocite;
    if (keys['s'])
        bat1.y += bat1.velocite;
    if (bat1.y < 20)
        bat1.y = 20;
    if (bat1.y > canvas.height - bat1.height - 20)
        bat1.y = canvas.height - bat1.height - 20;
    if (keys['ArrowUp'])
        bat2.y -= bat2.velocite;
    if (keys['ArrowDown'])
        bat2.y += bat2.velocite;
    if (bat2.y < 20)
        bat2.y = 20;
    if (bat2.y > canvas.height - bat2.height - 20)
        bat2.y = canvas.height - bat2.height - 20;
}

function updateBall(ball, bat1, bat2, scores) {
    if (ball.y + ball.vy > canvas.height - 25 || ball.y + ball.vy < 15) {
        ball.vy = -ball.vy;
        murSound.play();
    } else if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
        pointSound.play();
        if (ball.x + ball.vx < 0) {
            scores.score2++;
            ball.setPosition(canvas.width / 2, canvas.height / 2);
        } else if (ball.x + ball.vx > canvas.width) {
            scores.score1++;
            ball.setPosition(canvas.width / 2, canvas.height / 2);
        }
        ball.vx = -ball.vx;
        ball.vy = 0;
    } else if (ball.x === bat1.x + bat1.width && (ball.y + ball.size >= bat1.y && ball.y <= bat1.y + bat1.height)) {
        ball.vy = -ball.vy;
        ball.vx = -ball.vx;
        batSound.play();
        let zoneImpacte = bat1.height + ball.size * 2;
        let pointImpacte = ball.y - bat1.y + ball.size;
        if (pointImpacte < zoneImpacte / 2) {
            pointImpacte = zoneImpacte / 2 - pointImpacte;
            pointImpacte = -pointImpacte;
        } else if (pointImpacte > zoneImpacte / 2)
            pointImpacte = pointImpacte - zoneImpacte / 2;
        else
            pointImpacte = 0;
        ball.vy = ball.velocite * (pointImpacte / 50);
    } else if (ball.x === bat2.x - bat2.width && (ball.y + ball.size >= bat2.y && ball.y <= bat2.y + bat2.height)) {
        ball.vy = -ball.vy;
        ball.vx = -ball.vx;
        batSound.play();
        let zoneImpacte = bat2.height + ball.size * 2;
        let pointImpacte = ball.y - bat2.y + ball.size;
        if (pointImpacte < zoneImpacte / 2) {
            pointImpacte = zoneImpacte / 2 - pointImpacte;
            pointImpacte = -pointImpacte;
        } else if (pointImpacte > zoneImpacte / 2)
            pointImpacte = pointImpacte - zoneImpacte / 2;
        else
            pointImpacte = 0;
        ball.vy = ball.velocite * (pointImpacte / 50);
    } else if (ball.x + ball.vx < bat1.x + bat1.width && (ball.y + ball.vy + ball.size >= bat1.y && ball.y + ball.vy <= bat1.y + bat1.height)) {
        if (ball.x > bat1.x + bat1.width) {
            let distancex = ball.x - (bat1.x + bat1.width);
            let proportion = distancex / ball.vx;
            ball.x = bat1.x + bat1.width;
            ball.y += ball.vy * proportion;
            return;
        }
    } else if (ball.x + ball.vx > bat2.x && (ball.y + ball.vy + ball.size >= bat2.y && ball.y + ball.vy <= bat2.y + bat2.height)) {
        if (ball.x < bat2.x) {
            let distancex = bat2.x - (ball.x + ball.size);
            let proportion = distancex / ball.vx;
            ball.x = bat2.x - bat2.width;
            ball.y += ball.vy * proportion;
            return;
        }
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
}

function printInfo() {
    ctx.fillStyle = 'white';
    ctx.font = "18px 'Press Start 2P'";
    ctx.fillText('Appuyer sur j pour Jouer ', 100, 200);
    ctx.fillText('Appuyer sur p pour mettre sur Pause ', 100, 220);
    ctx.fillText('joueur 1: ', 100, 360);
    ctx.fillText('Press w pour Monter', 100, 380);
    ctx.fillText('Press s pour Descendre', 100, 400);
    ctx.fillText('joueur 2: ', 500, 360);
    ctx.fillText('Press Fleche du Haut pour Monter', 500, 380);
    ctx.fillText('Press Fleche du Bas pour Descendre', 500, 400);
}