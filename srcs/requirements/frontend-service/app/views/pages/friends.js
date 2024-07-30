import { Profil } from './ProfilClass.js';
import { sendHeartbeat } from '../../tools/tools.js';
import { sendPostRequest } from '../../tools/tools.js';

// sendHeartbeat();

export async function friends(navigateTo) {

    if (await refreshToken() === false) {
        navigateTo('/');
        const element = document.createElement('div');
        return element;
    }

    const profil = new Profil(navigateTo);
    let div = document.createElement('div');
    div.id = 'friends';

    try {
        await profil.fetchProfil(); // fetch user data
        // profil.generateFakeFriends();

        div = profil.renderFriendsPage();

    }
    catch (error) {
        console.error(error);
    }


    return div;
}



// Class Profil and utils functions //

async function sendGetRequest(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        }
});
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
