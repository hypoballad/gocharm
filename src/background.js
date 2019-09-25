
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == 'bbs') {
            fetch (request.url)
            .then(response => response.text())
            .then(text => sendResponse(text))
            .catch(error => console.log(error))
            return true
        }
    })