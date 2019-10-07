
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request)
        if (request.contentScriptQuery == 'fetch') {
            fetch (request.url)
            .then(response => response.text())
            .then(text => sendResponse(text))
            .catch(error => console.log(error))
            return true
        }
    })