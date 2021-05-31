"use strict";

const kTST_ID = "treestyletab@piro.sakura.ne.jp";
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var error_count = 0;
var list_count = 0;
var discarded_count = 0;

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Done waiting " + ms + "ms");
      resolve(ms)
    }, ms )
  })
} 

function onReloaded() {
  console.log(`Reloaded`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

/*
const filter = {
  properties: ["status"]
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  console.log('-----------------------');
  console.log("Updated tab: " + tabId);
  console.log("Changed attributes: ");
  console.log(changeInfo);
  console.log("New tab Info: ");
  console.log(tabInfo);
  console.log('-----------------------');
}

browser.tabs.onUpdated.addListener(handleUpdated, filter);
*/
async function myDiscard(tab) {
  await wait(60000);
  await browser.tabs.discard(tab);  // Not waiting on it to complete ... don't care
  console.log('Discard complete for tab ' + this);
}

async function ReloadAndDiscard(tab) {
  console.log('Reloading and discarding -> tab ' + tab.id + ': ' + tab.url);
  
  await browser.tabs.reload(tab.id);

  /* If the delay between a reload and discard is too low, TST can't keep up */
  //await wait(1000);

  let count = 0;

  do {
    count++;

    /* If the delay between a reload and discard is too low, TST can't keep up */
    console.log('Waiting for (' + count + ') reload to complete -> 500ms');
    await wait(500);

    var current_tab = await browser.tabs.get(tab.id);
    console.log('tab.status = ' + current_tab.status);
    
  } while (current_tab.status != "complete" && count <= 60)  // Quit if complete or more than 10 seconds
  
  if (count > 60) {
    error_count++;
    
    browser.tabs.executeScript(tab.id, {
      code: "window.stop();",
      allFrames: true,
      runAt: "document_start"
    });

    console.log('Waited too long: count = ' + count + ', error count = ', error_count);
  }

  console.log('Reload complete ... now discarding');
  // await wait(3000);  // Try waiting for 1s to ensure TST sees the "complete" and stops throbber

  //await wait(10000).then(myDiscard.call(tab.id), onError);
  myDiscard(tab.id);

  // await browser.tabs.discard(tab.id);  // Not waiting on it to complete ... don't care
  // console.log('Discard complete');
}

async function logTabs(tabs) {
  for (let tab of tabs) {
    // tab.url requires the `tabs` permission or a matching host permission.

    list_count++;  // Increment processed tabs
    console.log('Checking if discarded -> Tab ' + tab.id + ': ' + tab.url);

    if (tab.discarded) {
      discarded_count++;  // Increment discarded tabs count
      await ReloadAndDiscard(tab);
    }
  }

  console.log('======================================');
  console.log('Total tabs reviewed: ' + list_count);
  console.log('Total discarded tabs processed: ' + discarded_count);
  console.log('Total errors: ' + error_count);
  console.log('======================================');

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