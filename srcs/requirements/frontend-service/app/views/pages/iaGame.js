
import { initGame, stopGame } from '../../ia_bot/ia.js';
import { sendHeartbeat } from '../../tools/tools.js';
import { refreshToken, sendGetRequest } from '../../tools/tools.js';

export async function iaGame(navigateTo) {
    if (await refreshToken() === false) {
        navigateTo('/');
        const element = document.createElement('div');
        return element;
    }

    const div = document.createElement('div');
    div.id = 'iaGame';
    div.innerHTML = `
    	<div class="gameCanva">
			<canvas id="canvas" width="800" height="600"></canvas>
		</div>
		`;
    div.style.marginTop = '-145px';
    document.getElementById('app').appendChild(div);

	let user_name = await sendGetRequest('/api/auth/getUserInfo');
	user_name = user_name.username;

    await new Promise(resolve => requestAnimationFrame(resolve));

    if (typeof initGame === 'function') {
        initGame(navigateTo, user_name);
    }

    window.cleanup = () => {
        if (typeof stopGame === 'function') {
            stopGame(navigateTo);
        }
    };

    return div;
}
