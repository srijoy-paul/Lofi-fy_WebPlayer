const APP_URL = import.meta.env.VITE_APP_URL;
export const LOADED_TRACKS = "LOADED_TRACKS";
export const ENDPOINT = {
    profileInfo: "me",
    featuredPlaylist: "browse/featured-playlists?limit=5",
    toplists: "browse/categories/toplists/playlists?limit=10",
    playlist_songs: `playlists`,
    song: `tracks`,
    users_playlists: "me/playlists",
}

export const logOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    window.location.href = APP_URL;
}

export const SECTION_TYPE = {
    DASHBOARD: "DASHBOARD",
    PLAYLIST: "PLAYLIST",

}
export const setItemInLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}
export const getItemFromLocalStorage = (key) => {
    return JSON.parse(localStorage.getItem(key));
}

export function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
        seconds == 60 ?
            (minutes + 1) + ":00" :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
}