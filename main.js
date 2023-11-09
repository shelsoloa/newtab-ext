function updateTime() {
  let now = new Date();

  const time_header = document.querySelector("#time-display");
  time_header.textContent = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

window.onload = (event) => {
  updateTime();
  setInterval(updateTime, 1000); // call every second
};
