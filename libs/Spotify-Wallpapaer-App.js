var redirect_uri = 'http://localhost:5500/index.html';

var body = document.querySelector('body');
var title = document.querySelector('title');
var img = document.querySelector('img');
var coverSize = '500px'; //save as local storage

img.crossOrigin = 'Anonymous';
img.style.width = coverSize;
img.style.height = coverSize;

var refreshToken, accessToken, baseColor, test;
var songTitle = 'Nothing...';

var pingRate = 2000; //save as local storage && hide option to change

var colorThief = new ColorThief();
var spotify = new SpotifyWebApi({
	clientId: client_id,
	clientSecret: client_secret,
	redirectUri: redirect_uri,
});

spotify.setClientCode(client_id, client_secret);
var accessCode = window.location.search.substring(6);

spotify.getAuthToken(redirect_uri, accessCode).then(
	function (data) {
		accessToken = data.access_token;
		refreshToken = data.refresh_token;

		spotify.setAccessToken(accessToken);
		updateBackground();
		updateCover();
	},
	function (err) {
		console.log('Something went wrong!', err);
		window.location.replace(
			'https://accounts.spotify.com/authorize?client_id=' + client_id + '&response_type=code&redirect_uri=' + redirect_uri + '&scope=user-read-currently-playing user-read-playback-state'
		);
	}
);

function updateCover() {
	//console.log("Pinging Spotify!");
	spotify.getMyCurrentPlaybackState().then(
		function (data) {
			test = data;
			if (data !== undefined && data !== '') {
				localStorage.setItem('lastSongImg', data.item.album.images[0].url);
				songTitle = data.item.album.name + ' - ' + data.item.album.artists[0].name;
			}
			img.src = localStorage.getItem('lastSongImg');
		},
		function (err) {
			console.log('Refreshing Auth Token...');
			refreshAuthToken();
		}
	);

	if (title.innerText != 'Currently playing: ' + songTitle) {
		title.innerText = 'Currently playing: ' + songTitle;
	}

	positionCover();
	updateBackground();
	setTimeout(updateCover, pingRate);
}

function refreshAuthToken() {
	spotify.refreshAuthToken(redirect_uri, refreshToken).then(
		function (data) {
			spotify.setAccessToken(data.access_token);
		},
		function (err) {
			console.log('Something went wrong!', err);
		}
	);
}

function updateBackground() {
	img.addEventListener('load', function () {
		baseColor = colorThief.getColor(img);
		document.body.style.backgroundColor = 'rgb(' + baseColor[0] + ',' + baseColor[1] + ',' + baseColor[2] + ')';
	});
}

function positionCover() {
	if (window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
		body.style.height = 'calc(100vh - 40px)';
	} else {
		body.style.height = '100vh';
	}
}
