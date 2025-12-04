const btn = document.getElementById("menuhamb");
const menu = document.getElementById("menu");

if (btn && menu) {
  btn.addEventListener("click", () => {
    menu.classList.toggle("show");
  });
}
