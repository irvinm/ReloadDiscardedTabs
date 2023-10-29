![CI/CD](https://github.com/irvinm/ReloadDiscardedTabs/workflows/CI/CD/badge.svg)

# Reload Discarded Tabs

This addon can be used after restoring a session from "Tab Session Manager".  For each discarded tab, it reloads the tab one at a time then discards the tab when loading completes or a timeout occurs.  The goal is to get around the Firefox limitation that favicons can not be set when creating a discarded tab.  (https://bugzilla.mozilla.org/show_bug.cgi?id=1475240 - Allow setting favicon when creating discarded tabs)

# Features
- Clicking on the addon button starts the job, clicking it again stops it (v0.9.2)
- Jobs will process discarded tabs, but ignore ones that already have the favico set (v0.9.2)
  - Useful if you need to rerun the job several times due to any issues
- Added basic animation to addon button to show that a job is running (v0.9.2)
- Added simple notification summary of jobs completed (v0.9.2)
- Option to reload all discarded tabs or only in the current window (v0.9.1)
- Option to show the options page in light or dark mode (v0.9.1)
