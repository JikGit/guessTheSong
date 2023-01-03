async function getId(spotifyApi){
	const me = await spotifyApi.getMe();
	return me.body.id;
}


async function getArtistName(spotifyApi, artist){
	let data = await spotifyApi.searchTracks("artist: " + artist);
	return data.body.tracks.items[0].artists[0].name;
}

async function getSavedTracks(spotifyApi){
	let limit = 50;
	let startSong = 0;
	let arr = [];
	let tracks;

	do{
		tracks = await spotifyApi.getMySavedTracks({limit:limit, offset:startSong});
		for (let track of tracks.body.items)
			arr.push({"name":track.track.name, "artist":track.track.artists[0].name, "album":track.track.album.name, "id":track.track.id, "mp3": track.track.preview_url, "imgAlbum": track.track.album.images[0].url});
		startSong += limit;
	}while (tracks.body.next != null);

	return arr;
}

async function getSongsByArtisName(spotifyApi, artist){
	let tracks = [];
	let artistsObj = await spotifyApi.searchArtists(artist)	

	let limit = 30, offset = 0;
	let data = await spotifyApi.getArtistAlbums(artistsObj.body.artists.items[0].id, {limit: limit, offset: offset});

	let nSong = 0;
	let maxSong = 50;
	for (let albumObj of data.body.items){
		let songs = await getAlbumTracks(spotifyApi, albumObj.id, artist);
		for (let songObj of songs){
			songObj.album = albumObj.name;
			songObj.imgAlbum = albumObj.images[0].url;
			tracks.push(songObj);

			if (++nSong == maxSong){
				console.log("finished fetching data")
				return tracks;	
			}
		}
	}
	console.log("finished fetching data")
	return tracks;	
}

async function getAlbumTracks(spotifyApi, id, artist){
	let album = await spotifyApi.getAlbumTracks(id)
	let tracks = [];
	for (let track of album.body.items){
		if (track.artists[0].name.toLowerCase() == artist.toLowerCase()){
			if (track.preview_url == null){
				let data = await spotifyApi.searchTracks("track: " + track.name + " artist: " + artist);
				track = data.body.tracks.items[0];
			}
			tracks.push({"name":track.name, "artist":track.artists[0].name, "id":track.id, "mp3": track.preview_url});
		}
	}
	return tracks;
}

export {getId, getArtistName, getSavedTracks, getSongsByArtisName};
