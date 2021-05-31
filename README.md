# ReloadDiscardedTabs

This addon can be used after restoring a session from "Tab Session Manager".  For each discarded tab, it reloads each tab one at a time then waits a period of time (timing issues with favicons and TST) then discards the tab.  The goal is to get around the Firefox limitation that favicons can not be set when creating a discarded tab.  (https://bugzilla.mozilla.org/show_bug.cgi?id=1475240 - Allow setting favicon when creating discarded tabs)

Algorithm:
  * For each tab, if already discarded:
    * Reload tab
    * Poll for "tab.status == complete" OR wait 30 seconds
    * Wait 60 seconds then discard tab (Shorter delays sometimes had issues with the loading throbber or TST updating before being discarded)
