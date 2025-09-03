// this file contains functions that fetch data from firestore with paginations and caching logic
// make sure to put the parametres of the functions in order in your componentes

import { doc, endBefore, getCountFromServer, getDoc, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from "firebase/firestore";

// function to fetch data with pagination from firestore
export const fetchFirestoreDataWithPagination = async (collectionName, collectionRef, orderByField, orderByDirection, itemsPerPage, currentPage, goNext, goPrev, lastDoc, setLastDoc,
    firstDoc, setFirstDoc, setLoading, setError, cachePrefix, setData, setCurrentPage, whereField = null, whereValue = null
) => {
    setLoading(true)

    let queryRef = query(collectionRef, limit(itemsPerPage)); // Construct initial query with limiting

    // Add orderBy condition if provided
    if (orderByField && orderByDirection !== null) {
        queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
    }
    // Add where condition if provided
    if (whereField && whereValue !== null) {
        queryRef = query(queryRef, where(whereField, '==', whereValue));
    }

    // Pagination logic
    if (currentPage > 1) { // If not on the first page, adjust query to start after the last document fetched from the previous page
        if (goNext) {
            if (lastDoc) {
                // Adjust query to start after the last document fetched from the previous page
                queryRef = query(queryRef, startAfter(lastDoc));
            } else {
                // If there is no last document, fetch it from cached data
                const cachedData = localStorage.getItem(`${cachePrefix}${currentPage - 1}`);
                let parsedData = JSON.parse(cachedData).data
                if (cachedData && parsedData.length) {
                    try {
                        // Fetch the last document
                        const documentRef = doc(collectionRef, parsedData[parsedData.length - 1].id);
                        const docSnap = await getDoc(documentRef);
                        queryRef = query(queryRef, startAfter(docSnap));
                    } catch (error) {
                        console.log("error fetching document for pagination", error)
                    }
                }
            }
        }
        // Adjust query for previous page
        if (goPrev && firstDoc) queryRef = query(queryRef, endBefore(firstDoc), limitToLast(itemsPerPage));
    }

    try {
        const data = await getDocs(queryRef); // Fetch data from Firestore
        const filteredData = data.docs.map(doc => ({ id: doc.id, ...doc.data() })) // Extract data from documents

        if (filteredData.length) setData(filteredData); // Update state with fetched data
        else if (currentPage > 1) setCurrentPage(currentPage - 1); // No more items on this page, go back a page

        if (data.docs.length > 0) {
            setLastDoc(data.docs[data.docs.length - 1]); // Update lastDoc state with the last document fetched
            setFirstDoc(data.docs[0]); // Update firstDoc state with the first document fetched
        }

        // Save data to local storage for the current page
        if (filteredData.length) localStorage.setItem(`${cachePrefix}${currentPage}`, JSON.stringify({ timestamp: Date.now(), data: filteredData }));
        else setData([]);

        return filteredData;
    } catch (error) {
        console.error(`Error fetching ${collectionName}: `, error);
        setError("An error occurred while fetching Data. Please try again later.");
    } finally {
        setLoading(false)
    }
}

// Function to handle moving to the next page
export const handleNextPage = (currentPage, setCurrentPage, setGoNext, setGoPrev) => {
    setCurrentPage(currentPage + 1);
    setGoNext(true);
    setGoPrev(false);
};

// Function to handle moving to the previous page
export const handlePrevPage = (currentPage, setCurrentPage, setGoNext, setGoPrev) => {
    if (currentPage !== 1) {
        setCurrentPage(currentPage - 1);
        setGoNext(false);
        setGoPrev(true);
    }
};

// function to count total number of data
export const fetchTotalData = async (collectionName, setTotalData, cachePrefix, whereField = null, whereValue = null, setLoading = null) => {
    try {
        let queryRef = query(collectionName);

        // Add where condition if provided
        if (whereField && whereValue !== null) {
            queryRef = query(queryRef, where(whereField, '==', whereValue));
        }

        const totalSnapshot = await getCountFromServer(queryRef);
        setTotalData(totalSnapshot.data().count);

        // Save data to local storage for the current page
        localStorage.setItem(`${cachePrefix}`, JSON.stringify({ timestamp: Date.now(), data: totalSnapshot.data().count }));

        if (setLoading) setLoading(false);
    } catch (error) {
        console.error("Error fetching total number of data:", error);
    }
};

// function to fetch all data without pagination
export const fetchAllData = async (collectionRef, collectionName, setData, cachePrefix, setLoading = null, orderByField = null, orderByDirection = null, whereField = null, whereValue = null) => {
    try {
        let queryRef = query(collectionRef);
        // Add orderBy condition if provided
        if (orderByField && orderByDirection !== null) {
            queryRef = query(queryRef, orderBy(orderByField, orderByDirection));
        }
        // Add where condition if provided
        if (whereField && whereValue !== null) {
            queryRef = query(queryRef, where(whereField, '==', whereValue));
        }

        const data = await getDocs(queryRef); // Fetch data from Firestore
        const filteredData = data.docs.map(doc => ({ id: doc.id, ...doc.data() })) // Extract data from documents
        if (filteredData.length) {
            setData(filteredData); // Update state with fetched data
            localStorage.setItem(
                `${cachePrefix}`,
                JSON.stringify({ timestamp: Date.now(), data: filteredData })
            );
        }
        if (setLoading)
            setLoading(false)
    } catch (error) {
        console.error("Error fetching all data from collection: ", error);
    }
}

// Function to clear cache and reload data
export const handleCacheClear = (cachePrefix, setCurrentPage, setCachedData, cachedData) => {
    let keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }
    keys.map(key => {
        if (Array.isArray(cachePrefix)) cachePrefix.map(prefix => { if (key.startsWith(prefix)) localStorage.removeItem(key); })
        else if (key.startsWith(cachePrefix)) localStorage.removeItem(key);
    });
    if (setCurrentPage) setCurrentPage(1);
    setCachedData(!cachedData);
};

// Function to check if cached data has expired
export const isCacheExpired = (cachedData, cacheExpirationTime) => { return Date.now() > cachedData.timestamp + cacheExpirationTime; };

// function to display last time the data was fetched
export const formatTimeSinceLastCheck = (lastCheck) => {
    const now = Date.now();
    const timeDifference = now - lastCheck;

    // Convert milliseconds to seconds, minutes, hours, and days
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "maintenant";
    } else if (minutes < 60) {
        return minutes === 1 ? "1 minute" : `${minutes} minutes`;
    } else if (hours < 24) {
        return hours === 1 ? "1 heure" : `${hours} heures`;
    } else {
        return days === 1 ? "1 jour" : `${days} jours`;
    }
}