import { fetchRequest } from "../api";
import { ENDPOINT, logOut, millisToMinutesAndSeconds, SECTION_TYPE } from "../common";

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

const loadPlaylistTracks = ({ tracks }) => {
  let songsElement = "";
  let count = 1;
  for (let songs of tracks.items) {
    songsElement += `<section
        class="track grid grid-cols-[50px_2fr_1fr_1fr_50px] items-center justify-items-start rounded-sm py-2 text-gray-300 hover:bg-light-dark"
      >
        <p class="justify-self-center">${count}</p>
        <article class="track-title flex gap-2 items-center">
          <img class="h-10 w-10" src="${songs.track.album.images[0].url}" alt="kalus" />
          <section>
            <h2 class="text-md text-light">${songs.track.name}</h2>
            <h3 class="text-sm">${Array.from(songs.track.artists, artist => artist.name).join(", ")}</h3>
          </section>
        </article>
        <p>${songs.track.album.name}</p>
        <p>${new Date(songs.added_at).toDateString().slice(4)}</p>
        <p>${millisToMinutesAndSeconds(songs.track.duration_ms)}</p>
      </section>`;
    count++;
  }
  document.getElementsByClassName("tracks")[0].innerHTML = songsElement;
}

const loadContentforPlaylist = async (playlistId) => {
  // export const PLAYLIST_ID = playlistId;
  const endpoint = `${ENDPOINT.playlist_songs}/${playlistId}`;
  console.log(endpoint);
  const songsInPlaylist = await fetchRequest(endpoint);
  console.log(songsInPlaylist);
  document.getElementById("main-content").innerHTML = `<header class="px-8">
    <nav>
      <ul class="grid grid-cols-[50px_2fr_1fr_1fr_50px] text-gray-300">
        <li class="justify-self-center">#</li>
        <li>TITLE</li>
        <li>ALBUM</li>
        <li>DATE ADDED</li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
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
  <hr class="mt-2 mb-4 px-6" />
  <article class="tracks px-8">
  </article>`;
  loadPlaylistTracks(songsInPlaylist);
};

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
  });

  document.getElementById("content").addEventListener("scroll", (e) => {
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
      contentHeader.classList.add("bg-dark");
      contentHeader.classList.remove("bg-transparent");
    }
  });
  window.addEventListener("popstate", (e) => {
    console.log(e.state);
    loadSection(e.state);
  });
});
