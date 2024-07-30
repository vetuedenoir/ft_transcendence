import { Profil } from './ProfilClass.js';
import { sendHeartbeat } from '../../tools/tools.js';
import { sendPostRequest } from '../../tools/tools.js';

// sendHeartbeat();

export async function profil(navigateTo) {
//     const div = document.createElement('div');
//     div.id = 'profil';
//     div.innerHTML = `
//     <div class="profile-container">
//         <div class="user-info"></div>
//         <h2>Historique des parties</h2>
//         <table id="gameHistoryTable">
//             <thead>
//                 <tr>
//                     <th>Date</th>
//                     <th>Adversaire</th>
//                     <th>Score</th>
//                     <th>Résultat</th>
//                 </tr>
//             </thead>
//             <tbody></tbody>
//         </table>
//         <div class="pagination"></div>
//     </div>
// `;
    // const divUserInfo = div.querySelector('.user-info');

    // const gameHistoryTable = div.querySelector('#gameHistoryTable');
    // const tbody = gameHistoryTable.querySelector('tbody');
    // const pagination = div.querySelector('.pagination');

    if (await refreshToken() === false) {
        const element = document.createElement('div');
        navigateTo('/');
        return element;
    }

    const profil = new Profil(navigateTo);
    let div = document.createElement('div');
    div.id = 'profil';

    try {
        await profil.fetchProfil(); // fetch user data
        // profil.defaultProfil();
        // profil.renderProfil(divUserInfo);
        // profil.generate10falseGameHistory();
        // profil.renderGameHistory(tbody, pagination);
        div = profil.renderProfilPage();

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
