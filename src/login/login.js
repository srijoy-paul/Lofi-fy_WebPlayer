const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const scopes = "playlist-read-private user-follow-read user-top-read user-library-read user-read-currently-playing";
const APP_URL = import.meta.env.VITE_APP_URL;

const authorizeUser = () => {
    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${REDIRECT_URI}&show_dialog=true`;
    window.open(url, "Lofi-fy login", "width=800,height=600");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-btn").addEventListener("click", authorizeUser);
});

window.addItemsinLocalStorage = ({ accessToken, tokenType, expiresIn }) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("token_type", tokenType);
    localStorage.setItem("expires_in", Date.now() + (expiresIn * 1000));
    window.location.href = `${APP_URL}/dashboard/dashboard.html`;
}

window.addEventListener("load", () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        window.location.href = `${APP_URL}/dashboard/dashboard.html`;
    }

    if (window.opener !== null && !window.opener.closed) {
        window.focus();
        if (window.location.href.includes("error")) {
            window.close();
        }

        const { hash } = window.location;
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("#access_token");
        const tokenType = searchParams.get("token_type");
        const expiresIn = searchParams.get("expires_in");
        if (accessToken) {
            window.close();
            window.opener.addItemsinLocalStorage({ accessToken, tokenType, expiresIn })
        }
        else {
            window.close();
        }
    }
})