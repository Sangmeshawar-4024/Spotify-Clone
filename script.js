let currentsong = new Audio();
let songs;
let pause = false; 

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (secs < 10) {
        secs = "0" + secs;
    }

    return `${minutes}:${secs}`;
}

async function getsongs() {
    let songs = [];
    let a = fetch("http://127.0.0.1:3000/songs/");
    let response = await (await a).text();
    console.log(response);

    let element = document.createElement("div");
    element.innerHTML = response;

    let as = element.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songul.innerHTML += `<li><img class="invert" src="music.svg">
                  <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                  <img class="invert" src="play.svg">
                  </div></li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log(songName);
            playMusic(songName);
        });
    });
    return songs;
}

let currentSongIndex = 0;

const playMusic = (track, pause = false) => {
    currentsong.src = "/songs/" + track;
    if (!pause) {
        currentsong.play();
        document.querySelector("#play").src = "pause.svg"; 
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / --:--";

    currentsong.addEventListener("loadedmetadata", () => {
        let duration = isNaN(currentsong.duration) ? "--:--" : formatTime(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${duration}`;
    });
};

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.twxt();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if(e.href.includes("/songs/")){
       let folder = e.href.split("/").slice(-2)[0];
       let a = await fetch(`http://127.0.0.1:3000/songs/${folder}`)
       let response = await a.json();
       console.log(response)
       cardContainer.innerHTML = cardContainer.innerHTML +`  <div class="cardContainer">
                    <div class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24" color="#000000" fill="none">
                                <circle cx="14" cy="14" r="12" fill="green"/>
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" transform="scale(0.85) translate(2, 2)"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/8ef5a2aec8cce82aa28488dbf2a0dbe7.jpeg">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
      }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        console.log(e)
        e.addEventListener("click",async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })
}

async function main() {
    songs = await getsongs();
    playMusic(songs[0]);
    console.log(songs);

    const playButton = document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playButton.src = "pause.svg";
        } else {
            currentsong.pause();
            playButton.src = "play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        let currentTime = formatTime(currentsong.currentTime);
        let duration = isNaN(currentsong.duration) ? "--:--" : formatTime(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${duration}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });
    let previousVolume = 1;
    document.querySelector(".range input").addEventListener("input", (e) => {
        let volume = parseInt(e.target.value) / 100;
        currentsong.volume = volume;
        previousVolume = volume; 
        const volumeIcon = document.querySelector(".volume > img");
        if (volume === 0) {
            volumeIcon.src = "mute.svg";
        } else {
            volumeIcon.src = "volume.svg";
        }
    });
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        const volumeIcon = e.target;

        if (currentsong.volume > 0) {
            previousVolume = currentsong.volume;  
            currentsong.volume = 0;
            volumeIcon.src = "mute.svg";
            document.querySelector(".range input").value = 0;  
        } else {
            currentsong.volume = previousVolume;
            volumeIcon.src = "volume.svg";
            document.querySelector(".range input").value = previousVolume * 100;  
        }
    });
    document.querySelector("#previous").addEventListener("click", () => {
        let currentSongName = decodeURI(currentsong.src.split("/").pop()); 
        let index = songs.indexOf(currentSongName);

        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("This is the first song, can't go back.");
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let currentSongName = decodeURI(currentsong.src.split("/").pop()); 
        let index = songs.indexOf(currentSongName);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("This is the last song, can't go forward.");
        }
    });
    currentsong.volume = 1;
    document.querySelector(".range input").value = 100;
}
main();

