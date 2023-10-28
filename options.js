document.addEventListener("DOMContentLoaded", function () {
  // Load the saved reload option and set the appropriate radio button.
  browser.storage.sync.get("reloadOption").then((result) => {
    const reloadOption = result.reloadOption || "allTabs";
    document.querySelector(`input[value="${reloadOption}"]`).checked = true;
  });

  // Load the saved display mode and set the appropriate radio button.
  browser.storage.sync.get("displayMode").then((result) => {
    const displayMode = result.displayMode || "light";
    document.querySelector(`input[value="${displayMode}"]`).checked = true;

    // Apply the selected display mode class to the body.
    document.body.classList.add(displayMode);
  });

  // Handle the save button click event.
  document.getElementById("saveButton").addEventListener("click", function () {
    const selectedReloadOption = document.querySelector('input[name="reloadOption"]:checked').value;
    const selectedDisplayMode = document.querySelector('input[name="displayMode"]:checked').value;

    // Save the selected options to the extension's storage.
    browser.storage.sync.set({ reloadOption: selectedReloadOption, displayMode: selectedDisplayMode }).then(() => {
      console.log(`Reload option saved: ${selectedReloadOption}`);
      console.log(`Display mode saved: ${selectedDisplayMode}`);

      // Apply the selected display mode class to the body.
      document.body.className = ""; // Clear existing classes
      document.body.classList.add(selectedDisplayMode);
    });
  });
});
