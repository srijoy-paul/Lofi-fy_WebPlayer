import { logOut } from "./common";

const BASE_API_URL = import.meta.env.VITE_BASE_URL

export const getAcessToken = function () {
    const accessToken = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type");
    const expiresIn = localStorage.getItem("expires_in");

    if (Date.now() < expiresIn) {
        return { accessToken, tokenType };
    }
    else {
        //logout
        logOut();
    }
}

const createAPIConfig = ({ accessToken, tokenType }, method = "GET") => {
    return {
        headers: {
            Authorization: `${tokenType} ${accessToken}`
        },
        method
    }
}

export const fetchRequest = async (endpoint) => {
    const url = `${BASE_API_URL}/${endpoint}`;
    console.log(url);
    let response = await fetch(url, createAPIConfig(getAcessToken()));
    return response.json();
}
// export const {accessToken}=getAcessToken();