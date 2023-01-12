const mp3Elm = document.getElementById("audio");
const videoPlayer = document.getElementById("videoPlayer");
const topBarElm = document.getElementById("topBar");
const waitingElm = document.getElementById("waiting");
const submitBtn = document.getElementById("submitBtn");
const surrendBtn = document.getElementById("surrendBtn");
const findArtistBtn = document.getElementById("findArtistBtn")
const imgElm = document.getElementById("imgAlbum");
const playBtnElm = document.getElementById("playBtn");
const inputSongElm = document.getElementById("songNameInput");
const artistNameInputElm = document.getElementById("artistNameInput");
const containerArtistInputElm = document.getElementById("containerArtistInput");
const songCounterElm = document.getElementById("songCounter");
const possibilitaElm = document.getElementById("possibilita");
const punteggioElm = document.getElementById("punteggio");

let startSecond = 0;
let endSecond = 0;
let punteggio = 0;

let songName;
let artistName = "";
let startPossibilita = 3;
possibilitaElm.innerHTML = startPossibilita;

let alreadyPlayed = [];

async function generateRandomSong(){
	startWaiting();
	//niente canzoni uguali
	let songObj;
	do{
		response = await fetch("/getRandomSong?artistName="+artistName);
		songObj = await response.json();
		songObj = songObj.message;
		songName = songObj.name;
	}while (alreadyPlayed.includes(songName))

	console.log(songName)
	setGuessSong(songName, songObj.imgAlbum, songObj.mp3);

	endWaiting();
	playMusic(videoPlayer);
	setStartSecond();
	inputSongElm.value = "";

}

//previusEndSecond e' il tempo dove la canzone si e' fermata prima
function setStartSecond(previusEndSecond = 0){
	if (previusEndSecond)
		startSecond = new Date().getTime()/1000 - (previusEndSecond - startSecond);
	else
		startSecond = new Date().getTime()/1000
}

function setEndSecond(){
	endSecond = new Date().getTime()/1000;
}

function setGuessSong(songName, imgAlbum, songMp3){
	alreadyPlayed.push(songName);
	imgElm.src = imgAlbum;
	mp3Elm.src = songMp3;
	videoPlayer.load();
}

surrendBtn.addEventListener("click", () => {
	wrongSong(true);
})

function wrongSong(skip = false){
	videoPlayer.pause();
	inputSongElm.placeholder = "Canzone errata";
	possibilitaElm.innerHTML--;
	//se fine possibilita' cambio canzone
	if (possibilitaElm.innerHTML == 0 || skip){
		possibilitaElm.innerHTML = startPossibilita;
		calculatePunteggio(false);
		generateRandomSong();
		return;
	}
	playMusic(videoPlayer);
	setStartSecond(endSecond);
}

function nextSong(){
	inputSongElm.placeholder = "Indovina la canzone";
	songCounterElm.innerHTML++;
	possibilitaElm.innerHTML = startPossibilita;
	calculatePunteggio(true);
	generateRandomSong();
}

//spazi vuoti nel testo non contano, non case sensitive, feat non conta
submitBtn.addEventListener("click", () => {
	let triedSong = inputSongElm.value;
	if (triedSong == "")
		return;

	songName = 	songName.split("(")[0].split("[")[0].split("-")[0].replace("?", "").replace("'", "").replace(/ /g, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	triedSong = triedSong.replace(/ /g, "").replace("'", "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	//azzeccata
	if (triedSong == songName)
		nextSong();
	//non azzeccata
	else
		wrongSong();
})

function calculatePunteggio(indovinata){
	if (indovinata){
		//se non fai partire la canzone
		punteggio += Math.floor((25 - (endSecond - startSecond)) * 10)
	}else{
		if (endSecond != 0)
			punteggio -= Math.floor((endSecond - startSecond)*3)
		else 
			punteggio -= 50;
	}

	//inserisco il punteggio
	if (punteggio < 0)
		punteggio = 0;
	punteggioElm.innerHTML = punteggio;

	startSecond = 0;
	endSecond = 0;
}

//start the audio
function playMusic(musicPlayer){
	var promise = musicPlayer.play();
	if (promise !== undefined) {
		promise.then(_ => {}).catch(error => {});
	}
}

inputSongElm.addEventListener("keypress", (e) => {
	setEndSecond();
	videoPlayer.pause();
	if (e.key == "Enter")
		submitBtn.click();
})

artistNameInputElm.addEventListener("keypress", (e) => {
	if (e.key == "Enter")
		findArtistBtn.click();
})

function startWaiting(){
	topBarElm.classList.remove("visible");
	containerArtistInputElm.classList.add("waiting");
	waiting.classList.add("visible");
}

function endWaiting(){
	topBarElm.classList.add("visible");
	containerArtistInputElm.classList.remove("waiting");
	waiting.classList.remove("visible");
}

findArtistBtn.addEventListener("click", async () => {
	startWaiting();	
	artistName = artistNameInputElm.value;
	let response = await fetch("/getArtistName?artistName="+artistName);
	let message = await response.json();
	artistName = message.message;
	
	artistNameInputElm.value = artistName;

	await generateRandomSong();
})


playBtnElm.addEventListener("click", () => {playMusic(videoPlayer)});

//aspetto che inserisca un autore
window.onload = startWaiting();
