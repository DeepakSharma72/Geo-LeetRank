(() => {
    console.log("Geo LeetRank Extension enabled...");
    let contestName = null;
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { status, value } = obj;
        console.log(status);
        if (status) {
            contestName = value;
            getCountryRanking();
        }
    });

    const Toast = ({ message, type }) => {
        const ToastBarElement = document.createElement('div');
        
        if (type === 'SUCCESS') {
            ToastBarElement.style = `font-weight: bold; padding: 6px 15px; border-radius: 12px; position: absolute transition: all 0.3s; right: 20px; display: block; background-color:  #a0a0e9; color: #4f4f96;`;
        }
        else if(type === 'WARNING')
        {
            ToastBarElement.style = `font-weight: bold; padding: 6px 15px;  border-radius: 12px; position: absolute transition: all 0.3s; right: 20px; display: block; background-color: #ffd381; color: #666622;`;
        }
        else if(type === 'ERROR')
        {   
            ToastBarElement.style = `font-weight: bold; padding: 6px 15px;  border-radius: 12px; position: absolute transition: all 0.3s; right: 20px; display: block; background-color: #ffb7b7; color: red;`;
        }
        ToastBarElement.textContent = message;
        const Container = document.getElementsByClassName('container')[0];
        const Sibling = document.getElementsByClassName('callout callout-info')[0];
  
        Container.insertBefore(ToastBarElement, Sibling);

        setTimeout(()=>{
            ToastBarElement.style = 'display: none;';
        }, 8000);
    }

    const getUserRank = async () => {
        try {
            const userRow = document.getElementsByClassName("success")[0];
            if (!userRow) {
                return null;
            }
            else {
                const userRank = parseInt(userRow.getElementsByTagName('td')[0].innerText.split('/')[0]);
                return userRank;
            }
        }
        catch (err) {
            return null;
        }
    }

    const getActivePageNo = async () => {
        try {
            const ActivePageElement = document.getElementsByClassName('active page-btn')[0];
            if (!ActivePageElement) {
                return null;
            }
            const ActivePageNo = ActivePageElement.getElementsByTagName('a')[0].innerText;
            if (!ActivePageNo) {
                return null;
            }
            return parseInt(ActivePageNo);
        }
        catch (err) {
            return null;
        }
    }

    const getActiveUserCountryCode = async (rank) => {
        try {
            let page = Math.ceil(rank / 25);
            let idx = (rank - 1 + 25) % 25;
            let pageURL = `https://leetcode.com/contest/api/ranking/${contestName}/?pagination=${page}`;
            const responseData = await fetch(pageURL);
            const ranklist = await responseData.json();
            const rankData = await ranklist.total_rank;
            // console.log(rankData[idx]);
            if(rankData[idx].username !== document.getElementsByClassName('ranking-username')[0].title)
            {
                return -1;
            }
            return rankData[idx].country_code;
        }
        catch (err) {
            return null;
        }
    }

    const getCountryRanking = async () => {
        try {
            if(!contestName)
            {
                return Toast({message: 'Invalid Contest name!...', type: "ERROR"});
            }

            const userRank = await getUserRank();
            if (!userRank) {
                Toast({message: "Can't get country rankings because you didn't participated in this contest.", type: 'WARNING'});
                return;
            }

            const activePageNo = await getActivePageNo();
            if (!activePageNo)
                return;

            const activeUserCountryCode = await getActiveUserCountryCode(userRank);
            console.log(activeUserCountryCode);
            if(activeUserCountryCode === -1)
            {
                Toast({message: "Unable to fetch country rankings due to updated ranks not reflecting in the table yet. Check your profile page for the latest rank.", type: 'ERROR'})
                return;
            }
            if (!activeUserCountryCode)
            {
                Toast({message: "Oops.. country rank cannot be fetched because your country name is missing. Please update it for future contests.", type: 'ERROR'})
                return;
            }

            const maxPageLimit = Math.max(Math.ceil(userRank / 25), activePageNo);
            // console.log('page limit: ', maxPageLimit);
            // console.log('userRank: ', userRank, " | pageNo: ", activePageNo, " | contest name: ", contestName, " | country code: ", activeUserCountryCode);
            Toast({message: "Fetching country ranks, might take around 1-2 minutes.", type: 'SUCCESS'})

            let countryRank = 1;

            for (let page = 1; page <= maxPageLimit; page++) {
                let pageURL = `https://leetcode.com/contest/api/ranking/${contestName}/?pagination=${page}`;
                const responseData = await fetch(pageURL);
                const ranklist = await responseData.json();
                const rankData = await ranklist.total_rank;

                for (let j = 0; j < rankData.length; j++) {
                    if (rankData[j].rank === userRank) {
                        updateCountryRanksinUI({ index: 1, countryRank });
                    }

                    if (rankData[j].country_code === activeUserCountryCode) {
                        if (activePageNo == page)
                            updateCountryRanksinUI({ index: j + 2, countryRank });

                        countryRank++;
                    }
                }
            }

        }
        catch (err) {
            return;
        }
    }

    const updateCountryRanksinUI = ({ index, countryRank }) => {
        const rows = document.getElementsByTagName('tr');

        const row = rows[index];
        const rankblock = row.getElementsByTagName('td')[0];

        rankblock.innerText = rankblock.innerText.split('(')[0].trim();

        const spanElement = document.createElement('span');
        spanElement.style = 'margin: 4px; font-weight: bold; color: #0001ff;  font-size: small;';
        spanElement.textContent = `(${countryRank})`
        spanElement.title = 'Country ranking'

        rankblock.appendChild(spanElement);
    }

    // console.log('hurreeee everything is done....');
})();