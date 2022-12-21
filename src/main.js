import './style.css'

document.addEventListener("DOMContentLoaded",()=>{
  if(window.localStorage.getItem("accessToken"))
  window.location.href="./dashboard/dashboard.html";
  else window.location.href="./login/login.html";
})
