console.log('Lets write js');

let currentSong = new Audio()
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    let songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs

}
const playMusic = (track, pause = false) => {
    // let audio = new Audio('/songs/' + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = 'pause.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track)
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00'

    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songUL.innerHTML = ''
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="Images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>ABC</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert playbtn" src="Images/play.svg" alt="">
                            </div> 
                             </li>`
    }

    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML)
        })
    })
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log("Server Response:", response);
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cardContainer = document.querySelector('.cardContainer')
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-2)[1])
            //get metadata of the URL
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                        </div>`
        }
    }

    // Load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            // console.log(item, item.target.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })
}

async function main() {
    // Get the list of all the songs
    songs = await getSongs('songs/Recent')
    // console.log(songs)
    playMusic(songs[0], true)

    //Display all albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = 'pause.svg'
        }
        else {
            currentSong.pause()
            play.src = 'play.svg'
        }
    })

    // Listen for timeupdate event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)} `
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })

    // Add an event listener to seekbar

    document.querySelector('.seekbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    // Add an event listener for hamburger

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0'
    })

    // Add an event listener for close button

    document.querySelector('.close').addEventListener('click', () => {
        let Close = document.querySelector('.left').style.left = '-100%'
    })

    // Add an event listener to previous

    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })
}
main()