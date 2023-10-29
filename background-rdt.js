"use strict";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var error_count = 0;
var list_count = 0;
var discarded_count = 0;
var processed_count = 0;
var running = false;
let animationInterval;
let animationFrame = 1;

function startAnimation() {
  animationInterval = setInterval(() => {
    // Change the icon to the next frame
    browser.browserAction.setIcon({ path: `reload${animationFrame}.png` });

    // Increment the frame number, looping back to 1 if necessary
    animationFrame = (animationFrame % 4) + 1;
  }, 250); // Change the frame every 250 milliseconds
}

function stopAnimation() {
  // Clear the animation interval and reset the icon to a default state
  clearInterval(animationInterval);
  browser.browserAction.setIcon({ path: "reload1.png" });
}

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("RDT: Done waiting " + ms + "ms");
      resolve(ms)
    }, ms )
  })
} 

function onReloaded() {
  console.log(`RDT: Reloaded`);
}

function onError(error) {
  console.log(`RDT: Error: ${error}`);
}

async function myDiscard(tab) {
  await browser.tabs.discard(tab.id);  // Not waiting on it to complete ... don't care
  console.log('RDT: Discard initiated for tab ' + tab.id + ': ' + tab.url);
}

async function ReloadAndDiscard(tab) {
  console.log('RDT: Reloading and discarding -> Tab ' + tab.id + ': ' + tab.url);
  
  await browser.tabs.reload(tab.id);

  let count = 0;

  do {
    count++;

    /* If the delay between a reload and discard is too low, TST can't keep up */
    console.log('RDT: Waiting for (' + count + ') reload to complete -> 500ms');
    await wait(500);

    var current_tab = await browser.tabs.get(tab.id);
    console.log('RDT: tab.status = ' + current_tab.status);
    
  } while (current_tab.status != "complete" && count <= 60)  // Quit if complete or more than 30 seconds
  
  if (count > 60) {
    error_count++;
    
    browser.tabs.executeScript(tab.id, {
      code: "window.stop();",
      allFrames: true,
      runAt: "document_start"
    });

    console.log('RDT: Waited too long: count = ' + count + ', error count = ', error_count);
  }

  myDiscard(tab);
}

async function logTabs(tabs) {
  for (let tab of tabs) {
    
    // Check if we are still running and exit if not
    if (!running) {
      console.log('RDT: Stopping ...');
      stopAnimation();
      break;
    }

    list_count++;  // Increment processed tabs
    // tab.url requires the `tabs` permission or a matching host permission.
    console.log('RDT: Checking if discarded -> Tab ' + tab.id + ': ' + tab.url);

    // Check if tab is discarded 
    if (tab.discarded) {
      discarded_count++;  // Increment discarded tabs count

      // Check if tab has a favicon
      var current_tab = await browser.tabs.get(tab.id);
      if (current_tab.favIconUrl == null) {
        processed_count++;  // Increment processed tabs count 
        await ReloadAndDiscard(tab);
      }
    }
  }

  console.log('RDT: ======================================');
  console.log('RDT: Total tabs reviewed: ' + list_count);
  console.log('RDT: Total discarded tabs: ' + discarded_count);
  console.log('RDT: Total reloaded: ' + processed_count);
  console.log('RDT: Total errors: ' + error_count);
  console.log('RDT: ======================================');

  // Create a formatted message for the notification
  const notificationMessage = `Total tabs reviewed: ${list_count}\nTotal discarded tabs: ${discarded_count}\nTotal reloaded: ${processed_count}\nTotal errors: ${error_count}`;

    // Create a notification
  browser.notifications.create({
    type: "basic",
    iconUrl: "reload1.png", // URL to the icon image
    title: "Reload job complete",
    message: notificationMessage,
  });

  // Done - Reset application
  list_count = 0;
  discarded_count = 0;
  error_count = 0;
  processed_count = 0;
  running = false;  // Done - Set running to false
  stopAnimation();
}

function Start() {
  let querying = browser.tabs.query({});
  querying.then(logTabs, onError);
}

function StartThisWindow() {
  // Query for tabs in the current window.
  let querying = browser.tabs.query({ currentWindow: true });
  querying.then(logTabs, onError);
}

browser.browserAction.onClicked.addListener(() => {
  // Get the user's selected reload option.
  browser.storage.sync.get("reloadOption").then((result) => {
    const reloadOption = result.reloadOption || "allTabs";

    // Toggle running status
    running = !running;

    // Kick off job if button clicked
    if (running) {
      startAnimation();
      if (reloadOption === "allTabs") {
        // Reload all tabs logic.
        Start();
      } else if (reloadOption === "thisWindow") {
        // Reload only tabs in this window logic.
        StartThisWindow();
      }
    }
  });
});
