const mp3Elm = document.getElementById("audio");
const videoPlayer = document.getElementById("videoPlayer");
const btn = document.getElementById("playBtn");


function randomSong(){
	fetch('./songsData.json')
		.then((response) => response.json())
		.then((songsDataJson) => {
			let song;
			do{
				song = songsDataJson[Math.floor(Math.random() * songsDataJson.length)].mp3;
			}while (song == null)
			mp3Elm.src = song;
			videoPlayer.load();
		})
}

btn.addEventListener("click", () => {
	videoPlayer.play();		
})

randomSong()

