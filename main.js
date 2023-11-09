function _leadingZero(num) {
  return ('0' + num).slice(-2);
}

function updateTime() {
  let now = new Date();

  const date_header = document.querySelector('#date-display');
  const time_header = document.querySelector("#time-display");

  let date_string = 
    now.getFullYear() + '-' +
    _leadingZero(now.getMonth()) + '-' +
    _leadingZero(now.getDate());

  let time_string = 
    _leadingZero(now.getHours()) + ':' +
    _leadingZero(now.getMinutes()) + ':' +
    _leadingZero(now.getSeconds());

  date_header.textContent = date_string;
  time_header.textContent = time_string;
}

window.onload = (event) => {
  updateTime();
  setInterval(updateTime, 1000); // call every second
};
