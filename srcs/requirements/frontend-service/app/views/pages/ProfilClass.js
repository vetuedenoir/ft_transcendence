
//TODO: Ne pas oublier de securiser les inputs (escapeHTML + taille max)
import { sendHeartbeat } from '../../tools/tools.js';

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

async function sendPostRequest(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      },
      body: JSON.stringify(data)
    });
    return response.json();
}

export class Profil {
    constructor(navigateTo) {
        this.username = 'test';
        this.avatar = '';
        this.email = '';
        this.name = '';
        this.first_name = '';
        this.gameHistory = [];
        this.friendsList = [];

        this.nbGamePerPage = 5;
        this.page = 0;
        this.friendPage = 0;
        this.navigateTo = navigateTo;
    }

    async fetchProfil() {
        //console.log('fetchProfil');
        if (await refreshToken() === false) {
            this.navigateTo('/login');
            return;
        }
        const response = await sendGetRequest('/api/userman/get_user'); // Ici mettre le bon url
        const user = response;
        //console.log("user : ", user);
        this.username = user.username;
        this.avatar = user.avatar;
        this.email = user.email;
        this.name = user.lastname;
        this.first_name = user.firstname;
        this.gameHistory = user.matches_history;
        this.friendsList = user.friends;
    }

    defaultProfil() {
        this.username = 'Username';
        this.avatar = 'assets/avatar.jpg';
        this.email = 'default@default.fr';
        this.name = 'Nom';
        this.first_name = 'Prénom';
        this.gameHistory = [];
        this.friendsList = [];
    }

// ---------- Render profil functions ----------

    renderProfilPage() {
        //console.log('renderProfilPage');
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="profilPage">
            <div class="profilContent">
                <div class="user-info"></div>
                <div class="gameHistory">
                    <table id="gameHistoryTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Opponent</th>
                                <th>Score</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <div class="pagination"></div>
                </div>
            </div>
        </div>
        `;
        const divUserInfo = div.querySelector('.user-info');
        const gameHistoryTable = div.querySelector('#gameHistoryTable');
        const tbody = gameHistoryTable.querySelector('tbody');
        const pagination = div.querySelector('.pagination');
        const pageDiv = div.querySelector('.profilPage');
        const pageContent = div.querySelector('.profilContent');

        this.renderProfil(divUserInfo, pageDiv, pageContent);
        this.renderGameHistory(tbody, pagination);
        return div;
    }

    async avatarModifier(pageDiv) {
		// sendHeartbeat();
		//console.log('avatarModifier');
		const modifierDiv = document.createElement('div');
		const formAvatar = document.createElement('form');
		const inputAvatar = document.createElement('input');
		const submitInput = document.createElement('input');
		const returnButton = document.createElement('button');

		modifierDiv.classList.add('avatarModifier');
		inputAvatar.type = 'file';
		inputAvatar.accept = '.jpg';
		submitInput.type = 'submit';

		formAvatar.appendChild(inputAvatar);
		formAvatar.appendChild(submitInput);

		formAvatar.addEventListener('submit', async (event) => {
			event.preventDefault();
			//console.log('Change avatar');
			if (inputAvatar.files.length > 0) {
				const file = inputAvatar.files[0];
				if (file.type === 'image/jpeg') {
                    if (file.size > 5242880) {
                        alert('File size must not exceed 5 MB');
                        return;
                    }
					const formData = new FormData();
					formData.append('avatar', file);
					//console.log('Avatar file:', file);
					try {
						const response = await fetch('/api/userman/update_avatar/', {
							method: 'POST',
							body: formData,
							headers: {
								'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
							},
						});
						const result = await response.json();
						if (result.success == true) {
							alert('Avatar updated');
							this.navigateTo('/profil');
						}
						else {
							alert(result.message);
						}
					} catch (error) {
						console.error('Error updating avatar:', error);
						alert('An error occurred while updating the avatar. Please try again.');
					}
				} else {
					console.error('Mauvais format de fichier');
					alert('Mauvais format de fichier, veuillez choisir un fichier .jpg');
				}
			} else {
				console.error('Pas de fichier choisi');
				alert('Please choose a file.');
			}
		});

		returnButton.textContent = 'Retour';
		returnButton.classList.add('homeButtonCss');
		returnButton.id = 'returnButton';
		returnButton.addEventListener('click', () => {
			this.navigateTo('/profil');
		});

		modifierDiv.appendChild(formAvatar);
		modifierDiv.appendChild(returnButton);
		pageDiv.appendChild(modifierDiv);
			}

    async usernameModifier(pageDiv) {
		// sendHeartbeat();
        // Ici mettre le code pour modifier le username
        //console.log('usernameModifier');
        const modifierDiv = document.createElement('div');
        const usernameInput = document.createElement('input');
        const button = document.createElement('button');
        const returnButton = document.createElement('button');
        modifierDiv.classList.add('infoModifier');
        usernameInput.id = 'usernameInput';
        usernameInput.placeholder = 'Nouvel username';
        button.id = 'usernameButton';
        button.textContent = "Changer l'username";
        button.classList.add('homeButtonCss');
        button.addEventListener('click', async () => {
            // Ici mettre le code pour changer le username
            if (usernameInput.value.trim() === '') {
                alert("Username cannot be empty");
                usernameInput.focus();
                return;
            }
            if (usernameInput.value.length > 15) {
                alert("can't go over 15 char")
                usernameInput.focus();
                return;
            }
            //console.log('Change username');
            const url = '/api/userman/update_username/';
            const userinfo = await sendGetRequest('/api/auth/getUserInfo/');
            const data = { new_username: usernameInput.value, username: userinfo.username };
            const response = await sendPostRequest(url, data);
            if (response.success == false) {
                alert('Username already taken');
            }
            const url2 = '/api/auth/updateUsername/';
            const data2 = { new_username: usernameInput.value };
            const response2 = await sendPostRequest(url2, data2);
            if (response2.success == false) {
                alert(response2.message);
            }
            this.navigateTo('/profil');
        });
        returnButton.textContent = 'Retour';
        returnButton.classList.add('homeButtonCss');
        returnButton.id = 'returnButton';
        returnButton.addEventListener('click', () => {
            this.navigateTo('/profil');
        });

        modifierDiv.appendChild(usernameInput);
        modifierDiv.appendChild(button);
        modifierDiv.appendChild(returnButton);
        pageDiv.appendChild(modifierDiv);
    }

    async emailModifier(pageDiv) {
		// sendHeartbeat();
        // Ici mettre le code pour modifier l'email
        //console.log('emailModifier');
        const modifierDiv = document.createElement('div');
        const emailInput = document.createElement('input');
        const button = document.createElement('button');
        const returnButton = document.createElement('button');
        modifierDiv.classList.add('infoModifier');
        returnButton.textContent = 'Retour';
        returnButton.classList.add('homeButtonCss');
        returnButton.id = 'returnButton';
        emailInput.id = 'emailInput';
        emailInput.placeholder = 'Nouvel email';
        emailInput.type = 'email';
        button.textContent = "Changer l'email";
        button.classList.add('homeButtonCss');
        button.addEventListener('click', async () => {
            // Ici mettre le code pour changer l'email
            if (!emailInput.checkValidity()) {
                alert('Veuillez entrer une adresse email valide.');
                emailInput.focus();
                return;
            }
            if (emailInput.value.length > 30) {
                alert("can't go over 30 char")
                emailInput.focus();
                return;
            }
            //console.log('Change email');
            const url = '/api/userman/update_email/';
            const data = { new_email: emailInput.value };
            const userinfo = await sendGetRequest('/api/auth/getUserInfo/');
            const response = await sendPostRequest(url, data);
            if (response.success == false) {
                alert('Email already taken');
            }
			else {
            const url2 = '/api/auth/updateEmail/';
            const data2 = { email: emailInput.value };
            const response2 = await sendPostRequest(url2, data2);
            if (response2.success == false) {
                alert(response2.message);
            }
			if (response.success == true && response2.success == true)
				alert('Email changed');
            	this.navigateTo('/profil');
			}
        });
        returnButton.addEventListener('click', () => {
            this.navigateTo('/profil');
        });

        modifierDiv.appendChild(emailInput);
        modifierDiv.appendChild(button);
        modifierDiv.appendChild(returnButton);
        pageDiv.appendChild(modifierDiv);
    }

    async nameModifier(pageDiv) {
		// sendHeartbeat();
        // Ici mettre le code pour modifier le nom
        //console.log('nameModifier');
        const modifierDiv = document.createElement('div');
        const nameInput = document.createElement('input');
        const button = document.createElement('button');
        const returnButton = document.createElement('button');
        modifierDiv.classList.add('infoModifier');
        returnButton.textContent = 'Retour';
        returnButton.classList.add('homeButtonCss');
        returnButton.id = 'returnButton';

        nameInput.id = 'nameInput';
        nameInput.placeholder = 'Nouveau nom';
        button.textContent = 'Changer le nom';
        button.classList.add('homeButtonCss');
        button.addEventListener('click', async () => {
            if (nameInput.value.length > 15) {
                alert("can't go over 15 char")
                nameInput.focus();
                return;
            }
            // Ici mettre le code pour changer le nom
            //console.log('Change name');
            const url = '/api/userman/update_lastname/';
            const data = { new_name: nameInput.value };
            const user_info = await sendGetRequest('/api/auth/getUserInfo/');
            const response = await sendPostRequest(url, data);
            if (response.success == false) {
                alert('Name already taken');
            }
            else
                this.navigateTo('/profil');
        });

        returnButton.addEventListener('click', () => {
            this.navigateTo('/profil');
        });

        modifierDiv.appendChild(nameInput);
        modifierDiv.appendChild(button);
        modifierDiv.appendChild(returnButton);
        pageDiv.appendChild(modifierDiv);
    }

    async firstNameModifier(pageDiv) {
		// sendHeartbeat();
        //console.log('firstNameModifier');
        const modifierDiv = document.createElement('div');
        const firstNameInput = document.createElement('input');
        const button = document.createElement('button');
        const returnButton = document.createElement('button');
        modifierDiv.classList.add('infoModifier');
        returnButton.textContent = 'Retour';
        returnButton.classList.add('homeButtonCss');
        returnButton.id = 'returnButton';

        firstNameInput.id = 'firstNameInput';
        firstNameInput.placeholder = 'Nouveau prénom';
        button.textContent = 'Changer le prénom';
        button.classList.add('homeButtonCss');
        button.addEventListener('click', async () => {
            // Ici mettre le code pour changer le prénom
            if (firstNameInput.value.length > 15) {
                alert("can't go over 15 char")
                firstNameInput.focus();
                return;
            }
            //console.log('Change first name');
            const url = '/api/userman/update_firstname/';
            const data = { new_firstname: firstNameInput.value };
            const user_info = await sendGetRequest('/api/auth/getUserInfo/');
            const response = await sendPostRequest(url, data);
            if (response.success == false) {
                alert('First name already taken');
            }
            else
                this.navigateTo('/profil');
        });

        returnButton.addEventListener('click', () => {
            this.navigateTo('/profil');
        });

        modifierDiv.appendChild(firstNameInput);
        modifierDiv.appendChild(button);
        modifierDiv.appendChild(returnButton);
        pageDiv.appendChild(modifierDiv);
    }

    async passwordModifier(pageDiv) {
		// sendHeartbeat();
        //console.log('passwordModifier');
        const modifierDiv = document.createElement('div');
        const passwordInput = document.createElement('input');
        const button = document.createElement('button');
        const returnButton = document.createElement('button');
        modifierDiv.classList.add('infoModifier');
        returnButton.textContent = 'Retour';
        returnButton.classList.add('homeButtonCss');
        returnButton.id = 'returnButton';

        passwordInput.id = 'passwordInput';
        passwordInput.placeholder = 'Nouveau mot de passe';
        button.textContent = 'Changer le mot de passe';
        button.classList.add('homeButtonCss');
        button.addEventListener('click', async () => {
            // Ici mettre le code pour changer le mot de passe
            if (passwordInput.value.length > 15) {
                alert("can't go over 15 char")
                passwordInput.focus();
                return;
            }
            //console.log('Change password');
			const url2 = '/api/auth/updatePassword/';
			const data2 = { password: passwordInput.value };
			const response2 = await sendPostRequest(url2, data2);
			if (response2.success == false) {
				alert('Password already taken');
			}
			else
				this.navigateTo('/profil');
		});

        returnButton.addEventListener('click', () => {
            this.navigateTo('/profil');
        });

        modifierDiv.appendChild(passwordInput);
        modifierDiv.appendChild(button);
        modifierDiv.appendChild(returnButton);

        pageDiv.appendChild(modifierDiv);
    }

    async renderProfil(divUserInfo, pageDiv, pageContent) {
		// sendHeartbeat();
        //console.log('renderProfil');
        const userAvatar = document.createElement('img');
        const userUserame = document.createElement('h1');
        const userEmail = document.createElement('h2');
        const userName = document.createElement('h2');
        const userFirstName = document.createElement('h2');
        const password = document.createElement('h2');
        const avatarModifier = document.createElement('button');
        const usernameModifier = document.createElement('button');
        const emailModifier = document.createElement('button');
        const nameModifier = document.createElement('button');
        const firstNameModifier = document.createElement('button');
        const passwordModifier = document.createElement('button');
        const buttons = [avatarModifier, usernameModifier, emailModifier, nameModifier, firstNameModifier, passwordModifier];

		//console.log("this.avatar : ", this.avatar);
		// Call the function with a username
        userUserame.textContent = this.username;
        userEmail.textContent = this.email;
        userName.textContent = this.name;
        userFirstName.textContent = this.first_name;
        password.textContent = '**********';
        avatarModifier.id = 'avatarModifier';
        usernameModifier.id = 'usernameModifier';
        emailModifier.id = 'emailModifier';
        nameModifier.id = 'nameModifier';
        firstNameModifier.id = 'firstNameModifier';
        passwordModifier.id = 'passwordModifier';
        buttons.forEach((button) => {
            button.textContent = "Modifier";
            button.classList.add('homeButtonCss');
            button.addEventListener('click', () => {
                const functionName = button.id;
                pageDiv.removeChild(pageContent);
                this[functionName](pageDiv);
            });
        });
		userAvatar.src = this.avatar;
		//console.log("userAvatar.src : ", userAvatar.src);
        userAvatar.style.width = '150px';
        userAvatar.style.borderRadius = '50%';
        passwordModifier.textContent = 'Modifier mot de passe';

        divUserInfo.appendChild(userAvatar);
        divUserInfo.appendChild(avatarModifier);
        divUserInfo.appendChild(userUserame);
        divUserInfo.appendChild(usernameModifier);
        divUserInfo.appendChild(userEmail);
        divUserInfo.appendChild(emailModifier);
        divUserInfo.appendChild(userName);
        divUserInfo.appendChild(nameModifier);
        divUserInfo.appendChild(userFirstName);
        divUserInfo.appendChild(firstNameModifier);
        divUserInfo.appendChild(password);
        divUserInfo.appendChild(passwordModifier);
    }

    renderGameHistory(tbody, paginationDiv) {
		// sendHeartbeat();
        //console.log('renderGameHistory');
        const pageGames = this.gameHistory.slice(this.page * this.nbGamePerPage, (this.page + 1) * this.nbGamePerPage);
        this.renderPaginationGameHistory(paginationDiv, tbody);
        pageGames.forEach((game) => {
            const tr = document.createElement('tr');
            const date = document.createElement('td');
            const opponent = document.createElement('td');
            const score = document.createElement('td');
            const result = document.createElement('td');

            date.textContent = game.date;
            opponent.textContent = game.opponent_name;
            score.textContent = game.user_point + '-' + game.opponent_point;
            result.textContent = game.winner;

            tr.appendChild(date);
            tr.appendChild(opponent);
            tr.appendChild(score);
            tr.appendChild(result);
            tbody.appendChild(tr);
        });
    }

// ---------- Render friends functions ----------

    renderFriendsPage() {
		this.fetchProfil();
		// sendHeartbeat();
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="friendsPage">
            <h1>Friends</h1>
            <div class="addNewFriend">
                <input type="text" id="newFriend" placeholder="Ajouter un nouvel ami">
                <button id="addFriend">Ajouter</button>
            </div>
            <div class="friendsContent">
                <table id="friendsTable">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Username</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div class="pagination"></div>
            </div>
        </div>
        `;
        const friendsTable = div.querySelector('#friendsTable');
        const tbody = friendsTable.querySelector('tbody');
        const pagination = div.querySelector('.pagination');
        const pageDiv = div.querySelector('.friendsPage');
        const pageContent = div.querySelector('.friendsContent');
        const addFriendButton = div.querySelector('#addFriend');
        const newFriendInput = div.querySelector('#newFriend');
        const addNewFriendClass = div.querySelector('.addNewFriend');

        addFriendButton.addEventListener('click', async () => {
            const newFriend = newFriendInput.value;
            if (newFriend) {
                await this.addNewFriend(newFriend, addNewFriendClass);
            }

        });

        this.renderFriendsList(tbody, pagination);
        // this.renderPaginationFriendsList(pagination, tbody);
        return div;
    }

    renderFriendsList(tbody, paginationDiv) {
		// sendHeartbeat();
        //console.log('renderFriends');
        const pageFriends = this.friendsList.slice(this.friendPage * this.nbGamePerPage, (this.friendPage + 1) * this.nbGamePerPage);
        this.renderPaginationFriendsList(paginationDiv, tbody);
        pageFriends.forEach((friend) => {
            const tr = document.createElement('tr');
            const username = document.createElement('td');
            const avatar = document.createElement('td');
            const status = document.createElement('td');

            const img = document.createElement('img');
            img.src = friend.avatar;
			//console.log("friend.avatar : ", friend.avatar);
            img.style.width = '50px';
            img.style.borderRadius = '50%';

            avatar.appendChild(img);
            username.textContent = friend.username;
            status.textContent = friend.status_online;

            tr.appendChild(avatar);
            tr.appendChild(username);
            tr.appendChild(status);
            tbody.appendChild(tr);
        });
    }

    async addNewFriend(friend, addNewFriendClass) {
		// sendHeartbeat();
        //console.log('addNewFriend');
        // Ici mettre le code pour ajouter un nouvel ami
		const url = '/api/userman/update_friends/';
		const data = { friend_username: friend };
        const response = await sendPostRequest(url, data);
        if (response.success == true) {
			this.navigateTo('/friends');
		}
		else
			alert(response.message);
    }

// ---------- Render pagination function ----------

    renderPaginationGameHistory(paginationDiv, tbody) {
		// sendHeartbeat();
        const nbPages = Math.ceil(this.gameHistory.length / this.nbGamePerPage);
        const previousButton = document.createElement('button');
        const nextButton = document.createElement('button');
        const pageButtons = [];
        previousButton.textContent = 'Previous';
        nextButton.textContent = 'Next';
        previousButton.addEventListener('click', () => {
            if (this.page > 0) {
                this.page--;
                tbody.innerHTML = '';
                this.renderGameHistory(tbody, paginationDiv);
            }
        });
        nextButton.addEventListener('click', () => {
            if (this.page < nbPages - 1) {
                this.page++;
                tbody.innerHTML = '';
                this.renderGameHistory(tbody, paginationDiv);
            }
        });
        paginationDiv.innerHTML = '';
        paginationDiv.appendChild(previousButton);
        for (let pageNumber = this.page, j = 0; pageNumber < nbPages && j < 3; pageNumber++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = pageNumber + 1;
            pageButton.addEventListener('click', () => {
                this.page = pageNumber;
                tbody.innerHTML = '';
                this.renderGameHistory(tbody, paginationDiv);
            });
            pageButtons.push(pageButton);
            paginationDiv.appendChild(pageButton);
            j++;
        }
        paginationDiv.appendChild(nextButton);
    }

    renderPaginationFriendsList(paginationDiv, tbody) {
		// sendHeartbeat();
        const nbPages = Math.ceil(this.friendsList.length / this.nbGamePerPage);
        const previousButton = document.createElement('button');
        const nextButton = document.createElement('button');
        const pageButtons = [];
        previousButton.textContent = 'Previous';
        nextButton.textContent = 'Next';
        previousButton.addEventListener('click', () => {
            if (this.friendPage > 0) {
                this.friendPage--;
                tbody.innerHTML = '';
                this.renderFriendsList(tbody, paginationDiv);
            }
        });
        nextButton.addEventListener('click', () => {
            if (this.friendPage < nbPages - 1) {
                this.friendPage++;
                tbody.innerHTML = '';
                this.renderFriendsList(tbody, paginationDiv);
            }
        });
        paginationDiv.innerHTML = '';
        paginationDiv.appendChild(previousButton);
        for (let pageNumber = this.friendPage, j = 0; pageNumber < nbPages && j < 3; pageNumber++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = pageNumber + 1;
            pageButton.addEventListener('click', () => {
                this.friendPage = pageNumber;
                tbody.innerHTML = '';
                this.renderFriendsList(tbody, paginationDiv);
            });
            pageButtons.push(pageButton);
            paginationDiv.appendChild(pageButton);
            j++;
        }
        paginationDiv.appendChild(nextButton);
    }

// ---------- Generate fake data functions ----------

    generate10falseGameHistory() {
        for (let i = 0; i < 10; i++) {
            this.gameHistory.push({
                date: '01/01/2021',
                opponent: 'Opponent' + i,
                score: '0-0',
                result: 'Draw'
            });
        }
    }

    generateFakeFriends() {
        for (let i = 0; i < 100; i++) {
            this.friendsList.push({
                username: 'Friend' + i,
                avatar: 'assets/avatar.jpg',
                status: 'Online',
            });
        }
    }
}
