import express from 'express';
import {readFile} from 'fs/promises';
import {writeFile} from 'fs/promises';
import spotifyWebApi from 'spotify-web-api-node';
import {getId, getArtistName, getSavedTracks, getSongsByArtisName} from './spotifyGetter.js'

const userData = await readFile("./userData.json", "utf8");
const userDataJson = JSON.parse(userData);


const scopes = [
	'ugc-image-upload',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'streaming',
	'app-remote-control',
	'user-read-email',
	'user-read-private',
	'playlist-read-collaborative',
	'playlist-modify-public',
	'playlist-read-private',
	'playlist-modify-private',
	'user-library-modify',
	'user-library-read',
	'user-top-read',
	'user-read-playback-position',
	'user-read-recently-played',
	'user-follow-read',
	'user-follow-modify'
];

const spotifyApi = new spotifyWebApi({
	redirectUri: userDataJson["redirectUri"],
	clientId: userDataJson["clientId"],
	clientSecret: userDataJson["clientSecret"]
});

const app = express();
app.use(express.static('public'));

app.get('/', (request, response) => {
	return response.redirect(spotifyApi.createAuthorizeURL(scopes));	
})

app.get('/get', async (request, response) => {
	spotifyApi.setAccessToken(userDataJson.accessToken);
	let artistName = request.query.artistName;
	let realArtistName = await getArtistName(spotifyApi, artistName)

	await getSongsByArtisName(spotifyApi, realArtistName).then(async data => {await writeFile("./public/songsData.json", JSON.stringify(data), 'utf8')})
	return response.send(JSON.stringify({message:realArtistName}))
})

app.get('/play', async (request, response) => {
	response.send(await readFile("./public/play.html", "utf8"))
})

app.get('/callback', async (req, res) => {
	const error = req.query.error;
	const code = req.query.code;
	const state = req.query.state;

	if (error) {
		console.error('Callback Error:', error);
		return res.send(`Callback Error: ${error}`);
	}
	spotifyApi
		.authorizationCodeGrant(code)
		.then(data => {
			const accessToken = data.body['access_token'];
			const refreshToken = data.body['refresh_token'];
			const expires_in = data.body['expires_in'];

			userDataJson["accessToken"] = accessToken;
			userDataJson["refreshToken"] = refreshToken;
			
			//write to json
			writeFile('./userData.json', JSON.stringify(userDataJson), 'utf8');

			//reload the token in the spotifyApi obj
			spotifyApi.setAccessToken(accessToken);
			spotifyApi.setRefreshToken(refreshToken);
			// async () => {await getSavedTracks(spotifyApi).then(async data => {await writeFile("./public/songsData.json", JSON.stringify(data), 'utf8')});}

			//se passa troppo tempo refresho il token
			setInterval(async () => {
				const data = await spotifyApi.refreshAccessToken();
				accessToken = data.body['access_token'];

				console.log('The access token has been refreshed!');
				console.log('access_token:', accessToken);

				spotifyApi.setAccessToken(accessToken);
			}, expires_in / 2 * 1000);

		})
		.catch(error => {
			console.error('Error getting Tokens:', error);
			return res.send(`Error getting Tokens: ${error}`);
		});
		return res.redirect("./play")
})

app.listen(3000, () =>{console.log("app running")});





