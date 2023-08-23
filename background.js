
// Listen for tabs being updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("leetcode.com/contest") && tab.url.includes("ranking")) {
        const contestName = tab.url.split('/')[4];
        
        const message = {status: true, value: contestName};
        chrome.tabs.sendMessage(tabId,message);
    }
}
);