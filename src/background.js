chrome.tabs.onRemoved.addListener(tabId => {
  /* Remove tab's entry from the session storage after closing it.
  */
  chrome.storage.session.remove([String(tabId)]).
  catch(
    error => {
      console.log(`onRemoved: Failed to remove tab. ${error}`);
    }
  );
});
