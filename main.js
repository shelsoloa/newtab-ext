const GCLOUD_CLIENT_ID = '15117857728-2feuvr18blnsl77sqe6gr1v5rsjrtnv3.apps.googleusercontent.com';
const GCLOUD_API_KEY = 'AIzaSyDrvQT9nvkXs-Mofu8MhDoeu-4mlX6Azl8';
const GAPI_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;


/**
 * Add a leading zeros to a string if string is one digit.
 */
function _leadingZero(num) {
  return ('0' + num).slice(-2);
}


/**
 * Enables user interaction after all gapi and gis are loaded.
 */
function attemptDisplayAuthButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize-button').style.visibility = 'visible';
  }
}


/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  // TODO async () =>
  gapi.load('client', initializeGapiClient);
}


/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GCLOUD_CLIENT_ID,
    scope: GAPI_SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  attemptDisplayAuthButtons();
}


/**
 * Sign in the user upon button click
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout-button').style.visibility = 'visible';
    document.getElementById('authorize-button').innerText = 'Refresh';
    await listUpcomingEvents();
  }

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share
    // their data when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}


/**
 * Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize-button').innerText = 'Authorize';
    document.getElementById('signout-button').style.visibility = 'hidden';
  }
}


/**
 * Callback after the API client is loaded. Loads the discovery doc to 
 * initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: GCLOUD_API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  })
  gapiInited = true;
  attemptDisplayAuthButtons();
}


/**
 * Print the summary and start datetime/date of the next ten events in the
 * authorized user's calendar. If no events are found an appropriate message is
 * printed.
 */
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  const events = response.results.items;
  if (!events || events.length == 0) {
    document.getElementById('content').innerText = 'No events found.';
    return;
  }

  // Flatten the string to display
  const output = events.reduce(
    (str, event) =>
      `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
    'Events:\n'
  );
  document.getElementById('content').innerText = output;
}


/**
 * Update the date and time displays to show the current date and time.
 */
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
  document.getElementById('authorize-button').style.visibility = 'hidden';
  document.getElementById('signout-button').style.visibility = 'hidden';

  updateTime();
  setInterval(updateTime, 1000); // call every second
};
