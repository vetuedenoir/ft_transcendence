export { sendHeartbeat, sendGetRequest, sendPostRequest, refreshToken, escapeHTML };

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
		body: JSON.stringify(data),
	});
	return response.json();
}

async function refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
        const response = await sendPostRequest('/api/auth/refresh/', { refresh: refresh_token });
        if (response.access) {
            localStorage.setItem('access_token', response.access);
			await sendHeartbeat();
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

async function sendHeartbeat() {
	const url = '/api/userman/heartbeat/';
	const method = 'GET';
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
	};
	const response = await fetch(url, {
		method,
		headers,
	});
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return escape[match];
    });
}
