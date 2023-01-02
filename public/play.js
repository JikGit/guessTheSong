const mp3Elm = document.getElementById("audio");
const videoPlayer = document.getElementById("videoPlayer");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const enterBtn = document.getElementById("submitBtn");
const imgElm = document.getElementById("imgAlbum");
const inputElm = document.getElementById("songNameInput");
const songCounterElm = document.getElementById("songCounter");
const possibilitaElm = document.getElementById("possibilita");
const punteggioElm = document.getElementById("punteggio");

let startSecond = 0;
let endSecond = 0;
let punteggio = 0;

let songName;
let startPossibilita = 3;
possibilitaElm.innerHTML = startPossibilita;

function generateRandomSong(){
	fetch('./songsData.json')
		.then((response) => response.json())
		.then((songsDataJson) => {
			let song;
			let randomN;
			do{
				randomN = Math.floor(Math.random() * songsDataJson.length)
				song = songsDataJson[randomN].mp3;
			}while (song == null)
			songName = songsDataJson[randomN].name;
			imgAlbum.src = songsDataJson[randomN].imgAlbum;
			mp3Elm.src = song;
			videoPlayer.load();
		})
}

//spazi vuoti nel testo non contano, non case sensitive, feat non conta
submitBtn.addEventListener("click", () => {
	stopBtn.click();
	let triedSong = inputElm.value;
	inputElm.value = "";
	if (triedSong == "")
		return;

	if (songName.includes("("))
		songName = songName.split("(")[0]
	songName = songName.replace(/ /g, "").toLowerCase()
	triedSong = triedSong.replace(/ /g, "").toLowerCase()
	//azzeccata
	if (triedSong == songName){
		inputElm.placeholder = "Indovina la canzone";
		songCounterElm.innerHTML++;
		calculatePunteggio(true);
		generateRandomSong();
	//non azzeccata
	}else{
		inputElm.placeholder = "Canzone errata";
		possibilitaElm.innerHTML--;
		if (possibilitaElm.innerHTML == 0){
			possibilitaElm.innerHTML = startPossibilita;
			calculatePunteggio(false);
			generateRandomSong();
		}
	}
})

function calculatePunteggio(indovinata){
	if (indovinata){
		//se non fai partire la canzone
		if (startSecond == 0)
			punteggio += (25 * 30)
		else
			punteggio += Math.floor((25 - (endSecond - startSecond)) * 10)
	}else
		punteggio -= Math.floor((endSecond - startSecond)*3)

	//inserisco il punteggio
	if (punteggio < 0)
		punteggio = 0;
	punteggioElm.innerHTML = punteggio;

	startSecond = 0;
	endSecond = 0;


}

playBtn.addEventListener("click", () => {
	startSecond = new Date().getTime()/1000;
	videoPlayer.play();}
)
stopBtn.addEventListener("click", () => {
	endSecond = new Date().getTime()/1000;
	videoPlayer.pause();}
)

generateRandomSong()

