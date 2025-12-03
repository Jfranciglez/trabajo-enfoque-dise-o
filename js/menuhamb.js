const btn = document.getElementById("menuhamb");
const menu = document.getElementById("menu");

btn.addEventListener("click", () => {
  menu.classList.toggle("show");
});
