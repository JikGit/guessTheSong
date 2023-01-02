async function getId(spotifyApi){
	const me = await spotifyApi.getMe();
	return me.body.id;
}

async function getSavedTracks(spotifyApi){
	let limit = 50;
	let startSong = 0;
	let arr = [];
	let tracks;

	do{
		tracks = await spotifyApi.getMySavedTracks({limit:limit, offset:startSong});
		for (let track of tracks.body.items)
			arr.push({"name":track.track.name, "artist":track.track.artists[0].name, "album":track.track.album.name, "id":track.track.id, "mp3": track.track.preview_url});
		startSong += limit;
	}while (tracks.body.next != null);

	return arr;
}


export {getId, getSavedTracks};
