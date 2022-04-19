![CI/CD](https://github.com/irvinm/ReloadDiscardedTabs/workflows/CI/CD/badge.svg)

# Reload Discarded Tabs

This addon can be used after restoring a session from "Tab Session Manager".  For each discarded tab, it reloads the tab one at a time then discards the tab when loading completes or a timeout occurs.  The goal is to get around the Firefox limitation that favicons can not be set when creating a discarded tab.  (https://bugzilla.mozilla.org/show_bug.cgi?id=1475240 - Allow setting favicon when creating discarded tabs)

Algorithm:
  * For each tab, if already discarded:
    * Reload tab
    * Poll for "tab.status == complete" OR wait 30 seconds
    * Discard tab
