import { fetchRequest } from "../api";
import { ENDPOINT, getItemFromLocalStorage, LOADED_TRACKS, logOut, millisToMinutesAndSeconds, SECTION_TYPE, setItemInLocalStorage } from "../common";

var tracks_container = document.getElementsByClassName("tracks");
const audio = new Audio();
const playButton = document.getElementById("Play");
const prevButton = document.getElementById("Prev");
const nextButton = document.getElementById("Next");
const timeLine = document.getElementById("timeline");
const progressBar = document.getElementById("progressbar");
const songTimeline = document.getElementsByClassName("song-duration-completed")[0];
const totalSongDuration = document.getElementsByClassName("song-total-duration")[0];
const volumeControl = document.getElementById("volume");
var progressInterval;

const profileClickHandle = (e) => {
  e.stopPropagation();
  document.getElementById("profileMenu").classList.toggle("hidden");
};

const loadUserProfile = async () => {
  const profileButton = document.getElementById("user-profile-btn");
  const profileImage = document.getElementById("display-image");
  const profileName = document.getElementById("display-name");
  const logoutBtn = document.getElementById("logout");

  const userInfo = await fetchRequest(ENDPOINT.profileInfo);
  console.log(userInfo);
  profileName.querySelector("h3").innerText = userInfo.display_name;
  if (userInfo.images.length)
    profileImage.innerHTML = `<img src="${userInfo.images[0].url}" class="h-8 w-8">`;
  profileButton.addEventListener("click", profileClickHandle);
  logoutBtn.addEventListener("click", logOut);
};

const loadUsersPlaylists = async () => {
  const userPlaylistContiner = document.getElementById("userPlaylists-container");
  const user_Playlists = await fetchRequest(ENDPOINT.users_playlists);
  console.log(user_Playlists.items);
  userPlaylistContiner.innerHTML = " ";
  let index = 0;

  for (let playlist of user_Playlists.items) {
    let user_playlist = document.createElement("li");
    user_playlist.innerHTML = `<li playlist-id="${playlist.id}" class="user-playlist cursor-pointer line-clamp-1 hover:text-light">
    ${playlist.name}
  </li>`;
    user_playlist.addEventListener("click", () => {
      const section = { type: SECTION_TYPE.PLAYLIST, playList: playlist.id };
      history.pushState(section, "", `/dashboard/playlist/${playlist.id}`);
      loadContentforPlaylist(playlist.id)
    });
    userPlaylistContiner.appendChild(user_playlist);
  }
  // document.getElementsByClassName("user-playlist")[0].addEventListener("click", () => loadContentforPlaylist(user_Playlists.items[0].id));
}

const onPlaylistItemClicked = (e, id) => {
  const section = {
    type: SECTION_TYPE.PLAYLIST,
    playlist: id,
  };
  history.pushState(section, "", `playlist/${id}`);
  loadSection(section);
};

const loadPlaylist = async (endpoint, containerElementID) => {
  const Playlists = await fetchRequest(endpoint);
  console.log(Playlists);

  for (let playlistItem of Playlists.playlists.items) {
    let playlist = document.createElement("section");
    playlist.classList.add(
      "featured-song",
      "p-4",
      "bg-stone-900",
      "h-350",
      "hover:bg-light-dark",
      "hover:cursor-pointer",
      "rounded-md",
      "flex",
      "flex-col",
      "gap-2"
    );
    playlist.innerHTML = `<img class="rounded-md shadow" src="${playlistItem.images[0].url}" alt="${playlistItem.name} " />
        <h2 class="font-medium truncate mb-3">${playlistItem.name}</h2>
        <h3 class="text-zinc-400 font-semibold text-sm line-clamp-2">${playlistItem.description}</h3>`;
    playlist.addEventListener("click", (e) =>
      onPlaylistItemClicked(e, playlistItem.id)
    );
    document.getElementById(containerElementID).appendChild(playlist);
  }
};

const loadPlaylists = async () => {
  await loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlists");
  await loadPlaylist(ENDPOINT.toplists, "top-playlists");
};
const generateSections = () => {
  const sections = new Map();
  sections.set("Featured", "featured-playlists");
  sections.set("Toplists", "top-playlists");
  let playlistElements = "";
  for (let [type, elementId] of sections) {
    playlistElements += `<article class="">
        <h1 class="mb-5 text-2xl">
          <span class="hover:cursor-pointer hover:underline">${type}</span>
        </h1>
        <section
          id="${elementId}"
          class="grid grid-cols-auto-fill-cards gap-4 p-1"
        >
        </section>
      </article>`;
  }
  document.getElementById("main-content").innerHTML = playlistElements;
};

const onAudioMetaDataLoaded = () => {
  totalSongDuration.innerText = `0:${audio.duration.toFixed(0)}`;

}

const onPlayingOnPlayClick = (id, url) => {
  if (audio.src == url) {
    if (audio.paused) {
      audio.play();
      playButton.innerHTML = `<span class="material-symbols-outlined text-light hover:scale-110"
  style="font-size: 40px">
  pause_circle
  </span>`;
      document.getElementById(id).innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
  pause
  </span>`;
    }
    else {
      audio.pause();
      playButton.innerHTML = `<span class="material-symbols-outlined text-light hover:scale-110"
  style="font-size: 40px">
  play_circle
  </span>`;
      document.getElementById(id).innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
    play_arrow
    </span>`
    }
  }
}

const onTrackSelection = (id, e) => {
  document.querySelectorAll("#tracksContainer .track").forEach((findSelectedTrack) => {
    // console.log(findSelectedTrack);
    if (findSelectedTrack.querySelector("p button").id === id) {
      // console.log(findSelectedTrack.querySelector("p button").id, id);
      findSelectedTrack.classList.add("bg-gray", "selected");
      findSelectedTrack.querySelector("p .play").classList.add("visible");
      findSelectedTrack.querySelector("p .play").classList.remove("invisible");
      findSelectedTrack.querySelector("p .track_no").classList.add("invisible");
      // findSelectedTrack.querySelector("p .track_no").classList.remove("visible");
    }
    else {
      findSelectedTrack.classList.remove("bg-gray", "selected");
      findSelectedTrack.querySelector("p .play").classList.remove("visible");
      findSelectedTrack.querySelector("p .play").classList.add("invisible");
      findSelectedTrack.querySelector("p .track_no").classList.remove("invisible");
    }
  })
}

const findCurrentTrack = () => {
  const audioControl = document.getElementById("audio-control");
  const trackId = audioControl.getAttribute("track-id");
  console.log(trackId);

  if (trackId) {
    const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
    console.log(loadedTracks, "inside findcurrenttrack");
    const currentTrackIndex = loadedTracks?.findIndex(track => track.id === trackId);
    return { currentTrackIndex, tracks: loadedTracks };
  }
  return null;
}

const playNextTrack = () => {
  console.log("next btn clicked");
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > -1 && currentTrackIndex < tracks?.length - 1) {
    console.log(tracks[currentTrackIndex], tracks[currentTrackIndex + 1]);
    // document.getElementsByClassName("tracks")[0].getElementById(tracks[(currentTrackIndex)].id).innerHTML = "";
    // document.getElementById(tracks[currentTrackIndex].id).classList.remove("bg-gray", "selected");
    // document.getElementById(tracks[currentTrackIndex + 1].id).classList.add("bg-gray", "selected");
    // document.getElementById(tracks[currentTrackIndex].id).classList.remove("visible");
    // document.getElementById(tracks[currentTrackIndex].id).classList.add("invisible");
    // document.querySelectorAll("#tracksContainer .track")
    // track_no
    onPlayingOnPlayClick(tracks[currentTrackIndex].id, audio.src);
    let nextSong = tracks[(currentTrackIndex + 1)];
    // console.log(document.getElementsByClassName("tracks")[0].getElementById(nextSong.id).innerHTML);    // = 
    // `<span style="font-size:20px;" class="material-symbols-outlined">
    // pause
    // </span>`;

    onClickPlay(nextSong.id, nextSong.image, nextSong.Name, nextSong.artists, millisToMinutesAndSeconds(nextSong.duration), nextSong.url);
  }
}
const playPrevTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > 0 && currentTrackIndex < tracks?.length - 1) {
    let prevSong = tracks[(currentTrackIndex - 1)];

    onClickPlay(prevSong.id, prevSong.image, prevSong.Name, prevSong.artists, millisToMinutesAndSeconds(prevSong.duration), prevSong.url);
  }
}

const onClickPlay = async (trackId, trackImg, trackName, trackArtists, trackDuration, trackPreview) => {

  //update now playing section with song info
  localStorage.setItem("Song Name", trackName);
  localStorage.setItem("Artists Name", trackArtists);
  localStorage.setItem("Song Name", trackName);
  localStorage.setItem("Song image", trackImg);
  document.getElementById("track-img").setAttribute("src", trackImg);
  document.getElementById("track-name").innerText = trackName;
  document.getElementById("track-artists").innerText = trackArtists;
  document.getElementById("track-name").innerText = trackName;
  const audioControl = document.getElementById("audio-control");

  //playing the song,control and volume
  // const currentSong = fetchRequest(`${ENDPOINT.song}/${trackId}`);
  console.log(trackPreview);
  audio.src = trackPreview;
  audio.volume = 0.2;//0.5
  volumeControl.value = 20;
  audio.removeEventListener("loadedmetadata", onAudioMetaDataLoaded);
  audio.addEventListener("loadedmetadata", onAudioMetaDataLoaded);
  // document.getElementById(trackId).addEventListener("click", () => {
  //   onPlayingOnPlayClick(trackId);
  // })
  await audio.play();
  console.log("playing song", trackId);
  // if(trackId==)
  // tracks_container.getElementById("track_" + trackId).getElementById("song-name").classList.remove("playing");
  // const selectedTrack = tracks_container.getElementById(`track_${trackId}`);
  // selectedTrack.getElementById("song-name").classList.add("playing");
  playButton.innerHTML = `<span class="material-symbols-outlined text-light hover:scale-110"
  style="font-size: 40px">
  pause_circle  
  </span>`;
  document.getElementById(trackId).innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
  pause
  </span>`;
  playButton.removeEventListener("click", () => { onPlayingOnPlayClick(trackId, trackPreview) });
  playButton.addEventListener("click", () => onPlayingOnPlayClick(trackId, trackPreview));
  audioControl.setAttribute("track-id", trackId);
}

const loadPlaylistTracks = ({ tracks }) => {
  let songsElement = "";
  let count = 1;
  let loadedTracks = [];
  for (let songs of tracks.items.filter(item => item.track.preview_url)) {
    songsElement += `<section id='track_${songs.track.id}'
        class="track grid grid-cols-[50px_1.5fr_1fr_1fr_50px] items-center justify-items-start rounded-sm py-2 text-gray-300/70 gap-2 hover:bg-light-dark  "
      >
        <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track_no">${count}</span></p>
        <article class="track-title flex gap-2 items-center justify">
          <img class="h-10 w-10" src="${songs.track.album.images[0].url}" alt="" />
          <section class="flex flex-col gap-2">
            <h2 id="song-name" class="text-base text-light line-clamp-1">${songs.track.name}</h2>
            <h3 id="artist-name" class="text-sm line-clamp-1">${Array.from(songs.track.artists, artist => artist.name).join(", ")}</h3>
          </section>
        </article>
        <p id="album" class="text-base line-clamp-2">${songs.track.album.name}</p>
        <p id="date-added" class="text-sm">${new Date(songs.added_at).toDateString().slice(4)}</p>
        <p id="duration" class="text-sm">${millisToMinutesAndSeconds(songs.track.duration_ms)}</p>
      </section>`;
    count++;
    // console.log("here", songs.track);
    let id = songs.track.id;
    let artists = Array.from(songs.track.artists, artist => artist.name).join(", ");
    let Name = songs.track.name;
    let album = songs.track.album;
    let duration = songs.track.duration_ms;
    let url = songs.track.preview_url;
    let image = songs.track.album.images[0].url;
    // ({ id, album, duration_ms, preview_url, album: { images: [0].url } } = songs.track);
    loadedTracks.push({ id, artists, Name, album, duration, url, image });
  }
  document.getElementById("tracksContainer").innerHTML = songsElement;
  setItemInLocalStorage(LOADED_TRACKS, loadedTracks);


  for (let i = 0; i < tracks.items.length; i++) {
    let songs = tracks.items[i];
    const play_btn = document.createElement("button");
    console.log(songs);
    play_btn.id = songs.track.id;
    play_btn.className = "play w-full text-lg absolute left-0 flex items-center justify-center invisible hover:visible";
    play_btn.innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
    play_arrow
    </span>`;
    play_btn.addEventListener("click", () => { onClickPlay(play_btn.id, songs.track.album.images[0].url, songs.track.name, Array.from(songs.track.artists, artist => artist.name).join(", "), millisToMinutesAndSeconds(songs.track.duration_ms), songs.track.preview_url) })
    document.getElementsByClassName("track")[i].querySelector("p").appendChild(play_btn);
    document.getElementsByClassName("track")[i].addEventListener("click", (e) => onTrackSelection(songs.track.id, e));
  }

}

const loadContentforPlaylist = async (playlistId) => {
  // export const PLAYLIST_ID = playlistId;
  const endpoint = `${ENDPOINT.playlist_songs}/${playlistId}`;
  console.log(endpoint);
  const songsInPlaylist = await fetchRequest(endpoint);
  console.log("playlist", songsInPlaylist);

  document.getElementById("content-cover").innerHTML = `<section class="flex gap-5">
  <img src="${songsInPlaylist.images[0].url}" alt="Pl img" class="h-52 w-52"/>
  <section class="flex flex-col gap-2 justify-center">
    <p>Playlist</p>
    <h1 class="text-4xl font-semibold">${songsInPlaylist.name}</h1>
    <p>${songsInPlaylist.description}</p>
    <section class="flex items-center">
      <p class="p-1">${songsInPlaylist.owner.display_name}</p><span style="font-size:7px;" class="material-symbols-outlined pb-2 self-end">
      fiber_manual_record 
      </span>
      <p class="p-1">${songsInPlaylist.followers.total} likes</p><span style="font-size:7px;" class="material-symbols-outlined pb-2 self-end">
      fiber_manual_record
      </span>
      <p class="p-1">${songsInPlaylist.tracks.total} songs</p>
    </section>
  </section>
</section>`;

  document.getElementById("main-content").innerHTML = `<header class="mx-8 py-2 border-b border-gray-600/50" id="tracksHeader">
    <nav>
      <ul class="grid grid-cols-[50px_1.5fr_1fr_1fr_50px] text-gray-300/75">
        <li class="text-xs flex flex-col items-center justify-center "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
      </svg>
      </li>
        <li class="text-sm">TITLE</li>
        <li class="text-sm">ALBUM</li>
        <li class="text-sm">DATE ADDED</li>
        <li class="text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </li>
      </ul>
    </nav>
  </header>
  <article id="tracksContainer" class="tracks px-8 mt-4">
  </article>`;
  loadPlaylistTracks(songsInPlaylist);
};

const onContentScroll = (e) => {
  let scrollTop = e.target.scrollTop;
  const contentHeader = document.getElementById("content-nav");
  const contentCover = document.getElementById("content-cover");
  if (scrollTop >= contentHeader.offsetHeight) {
    contentHeader.classList.add("sticky", "top-0");
    // contentHeader.classList.remove("bg-transparent");
  } else {
    contentHeader.classList.remove("sticky", "top-0", "bg-dark-base");
    contentHeader.classList.add("bg-transparent");
  }
  if (scrollTop >= contentCover.offsetHeight) {
    contentHeader.classList.add("bg-dark", "z-10");
    contentHeader.classList.remove("bg-transparent");
  }
  else {
    contentHeader.classList.remove("bg-dark", "z-10");
    contentHeader.classList.add("bg-transparent");
  }

  if (history.state.type === SECTION_TYPE.PLAYLIST) {
    const tracksHeader = document.getElementById("tracksHeader");
    if (scrollTop > (contentCover.offsetHeight - contentHeader.offsetHeight)) {
      tracksHeader.classList.add("sticky", "bg-dark-secondry", "px-8", "z-10");
      tracksHeader.classList.remove("mx-8");
      tracksHeader.style.top = `${contentHeader.offsetHeight}px`;
    }
    else {
      tracksHeader.classList.remove("sticky", "bg-dark-secondry", "px-8", "z-10");
      tracksHeader.classList.add("mx-8");
      tracksHeader.style.top = `revert`;
    }
  }
}

const loadSection = async (section) => {
  if (section.type === SECTION_TYPE.DASHBOARD) {
    generateSections();
    await loadPlaylists();
  } else {
    //load songs in that playlist
    loadContentforPlaylist(section.playlist);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();
  await loadUsersPlaylists();
  const section = {
    type: SECTION_TYPE.DASHBOARD,
  };
  history.pushState(section, "", "");
  loadSection(section);
  // await loadPlaylists();
  document.addEventListener("click", () => {
    if (!document.getElementById("profileMenu").classList.contains("hidden")) {
      document.getElementById("profileMenu").classList.add("hidden");
    }

    if (localStorage.getItem("Song Name"))
      document.getElementById("track-name").innerText = localStorage.getItem("Song Name");
    if (localStorage.getItem("Song Image"))
      document.getElementById("track-img").setAttribute("src", localStorage.getItem("Song image"))
  });

  audio.addEventListener("play", () => {
    console.log(audio);

    progressInterval = setInterval(() => {
      if (audio.paused) return;
      // songTimeline.innerText = audio.currentTime.toFixed(0);
      songTimeline.innerText = `${audio.currentTime.toFixed(0) < 10 ? "0:0" + audio.currentTime.toFixed(0) : "0:" + audio.currentTime.toFixed(0)}`;
      progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
      let id = document.getElementById("audio-control").getAttribute("track-id");
      let prevele = document.getElementById(id);

      if (songTimeline.innerText === "0:30") {
        playButton.innerHTML = `<span class="material-symbols-outlined text-light hover:scale-110"
        style="font-size: 40px">
        play_circle  
        </span>`;
        prevele.innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
        play_arrow
        </span>`;
      }
      else {
        playButton.innerHTML = `<span class="material-symbols-outlined text-light hover:scale-110"
        style="font-size: 40px">
        pause_circle  
        </span>`;
        prevele = document.getElementById(id);
        // console.log(prevele.innerHTML, "here");
        prevele.innerHTML = `<span style="font-size:20px;" class="material-symbols-outlined">
        pause
        </span>`;
      }
    }, 100);
  });

  audio.addEventListener("pause", () => {
    if (progressInterval)
      clearInterval(progressInterval);
  });
  volumeControl.addEventListener("change", () => {
    audio.volume = volumeControl.value / 100; //audio volume takes value from 0.0(silent) to 1.0(loudest)
  });
  timeLine.addEventListener("click", (e) => {
    const progressBarWidth = window.getComputedStyle(timeLine).width;
    const timeToSeek = (e.offsetX / parseInt(progressBarWidth)) * audio.duration;
    console.log(timeToSeek);
    audio.currentTime = timeToSeek;
    progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });
  prevButton.addEventListener("click", () => {
    playPrevTrack();

  })
  nextButton.addEventListener("click", playNextTrack);

  document.getElementById("content").removeEventListener("scroll", onContentScroll);
  document.getElementById("content").addEventListener("scroll", onContentScroll);
  window.addEventListener("popstate", (e) => {
    console.log(e.state);
    loadSection(e.state);
  });
});
