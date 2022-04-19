"use strict";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var error_count = 0;
var list_count = 0;
var discarded_count = 0;

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
  await wait(60000);
  await browser.tabs.discard(tab);  // Not waiting on it to complete ... don't care
  console.log('RDT: Discard complete for tab ' + this);
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
    
  } while (current_tab.status != "complete" && count <= 60)  // Quit if complete or more than 60 seconds
  
  if (count > 60) {
    error_count++;
    
    browser.tabs.executeScript(tab.id, {
      code: "window.stop();",
      allFrames: true,
      runAt: "document_start"
    });

    console.log('RDT: Waited too long: count = ' + count + ', error count = ', error_count);
  }

  myDiscard(tab.id);
}

async function logTabs(tabs) {
  for (let tab of tabs) {
    
    list_count++;  // Increment processed tabs
    // tab.url requires the `tabs` permission or a matching host permission.
    console.log('RDT: Checking if discarded -> Tab ' + tab.id + ': ' + tab.url);

    if (tab.discarded) {
      discarded_count++;  // Increment discarded tabs count
      await ReloadAndDiscard(tab);
    }
  }

  console.log('RDT: ======================================');
  console.log('RDT: Total tabs reviewed: ' + list_count);
  console.log('RDT: Total discarded tabs processed: ' + discarded_count);
  console.log('RDT: Total errors: ' + error_count);
  console.log('RDT: ======================================');

  // Reset counts
  list_count = 0;
  discarded_count = 0;
  error_count = 0;
}

function Start() {
  let querying = browser.tabs.query({});
  querying.then(logTabs, onError);
}

browser.browserAction.onClicked.addListener(() => {
  Start();
});