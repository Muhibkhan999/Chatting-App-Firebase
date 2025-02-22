import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDyyKEfco7HvaLuvWC3RYkMnyER2SjBdX4",
    authDomain: "students-data-d86ad.firebaseapp.com",
    projectId: "students-data-d86ad",
    storageBucket: "students-data-d86ad.appspot.com",
    messagingSenderId: "202639565303",
    appId: "1:202639565303:web:a37ac7b15f3a960d4fcef2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the logged-in user
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        const requestsRef = doc(db, "friendRequests", userId);
        const requestsSnap = await getDoc(requestsRef);

        if (requestsSnap.exists()) {
            const requestsData = requestsSnap.data();
            const requests = requestsData.requests || [];

            console.log("Friend Requests Snapshot:", requests.length);

            // Display requests with Accept/Reject buttons
            const requestsList = document.getElementById("requestsList");
            requestsList.innerHTML = "";

            for (const friendId of requests) {
                const friendRef = doc(db, "students", friendId);
                const friendSnap = await getDoc(friendRef);
                const friendData = friendSnap.data();

                if (!friendData) {
                    console.warn(`Friend request from unknown user ID: ${friendId}`);
                    continue; // Skip if user data is missing
                }

                const friendName = friendData.displayName || "Unknown User";
                const requestMessage = document.createElement("div");
                requestMessage.innerHTML = `${friendName} sent you a friend request.`;

                // Accept Button
                const acceptBtn = document.createElement("button");
                acceptBtn.innerText = "Accept";
                acceptBtn.addEventListener("click", async () => {
                    await acceptFriendRequest(userId, friendId, friendName);
                });

                // Reject Button
                const rejectBtn = document.createElement("button");
                rejectBtn.innerText = "Reject";
                rejectBtn.addEventListener("click", async () => {
                    await rejectFriendRequest(userId, friendId);
                });

                requestMessage.appendChild(acceptBtn);
                requestMessage.appendChild(rejectBtn);
                requestsList.appendChild(requestMessage);
            }
        } else {
            console.log("No friend requests found.");
        }
    }
});

// Accept Friend Request
async function acceptFriendRequest(userId, friendId, friendName) {
    try {
        const userFriendsRef = doc(db, "friends", userId);
        const friendFriendsRef = doc(db, "friends", friendId);
        const userRequestsRef = doc(db, "friendRequests", userId);

        // Ensure friends collection exists
        await updateDoc(userFriendsRef, { friends: arrayUnion(friendId) }).catch(async () => {
            await setDoc(userFriendsRef, { friends: [friendId] });
        });
        await updateDoc(friendFriendsRef, { friends: arrayUnion(userId) }).catch(async () => {
            await setDoc(friendFriendsRef, { friends: [userId] });
        });

        // Remove friend request
        await updateDoc(userRequestsRef, { requests: arrayRemove(friendId) }).catch(async () => {
            await setDoc(userRequestsRef, { requests: [] });
        });

        console.log(`Friend request from ${friendId} accepted!`);
        openPrivateChat(userId, friendId, friendName); // Open chat after accepting
    } catch (error) {
        console.error("Error accepting friend request:", error);
    }
}

// Reject Friend Request
async function rejectFriendRequest(userId, friendId) {
    try {
        const userRequestsRef = doc(db, "friendRequests", userId);
        const friendRequestsRef = doc(db, "friendRequests", friendId);

        // Remove request from the user's pending list
        await updateDoc(userRequestsRef, { requests: arrayRemove(friendId) }).catch(async () => {
            await setDoc(userRequestsRef, { requests: [] });
        });

        // Notify the sender that their request was rejected
        alert("Friend request rejected.");

        // Optionally store a rejection notification for the sender
        await updateDoc(friendRequestsRef, { rejectedRequests: arrayUnion(userId) }).catch(async () => {
            await setDoc(friendRequestsRef, { rejectedRequests: [userId] });
        });

        console.log(`Friend request from ${friendId} rejected.`);
    } catch (error) {
        console.error("Error rejecting friend request:", error);
    }
}

// // Open Private Chat
// async function openPrivateChat(userId, friendId, friendName) {
//     const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
//     const chatRef = doc(db, "privateChats", chatId);

//     // Ensure chat collection exists
//     const chatSnap = await getDoc(chatRef);
//     if (!chatSnap.exists()) {
//         await setDoc(chatRef, { messages: [] });
//     }

//     const chatWindow = document.createElement("div");
//     chatWindow.style.position = "fixed";
//     chatWindow.style.bottom = "0";
//     chatWindow.style.left = "0";
//     chatWindow.style.width = "300px";
//     chatWindow.style.height = "400px";
//     chatWindow.style.backgroundColor = "#fff";
//     chatWindow.style.border = "1px solid #ccc";
//     chatWindow.style.padding = "10px";
//     chatWindow.style.overflowY = "auto";

//     chatWindow.innerHTML = `
//         <h3>Chat with ${friendName}</h3>
//         <div id="chatMessages" style="height: 300px; overflow-y: scroll;"></div>
//         <input type="text" id="chatInput" placeholder="Type a message..." style="width: 100%;">
//         <button id="sendChat">Send</button>
//     `;
//     document.body.appendChild(chatWindow);

//     loadChatMessages(chatId);

//     document.getElementById("sendChat").addEventListener("click", async () => {
//         const message = document.getElementById("chatInput").value;
//         if (message) {
//             await sendMessage(chatId, userId, message);
//         }
//     });
// }
async function openPrivateChat(userId, friendId, friendName) {
    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const chatRef = doc(db, "privateChats", chatId);

    // Ensure chat collection exists
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [] });
    }

    const chatWindow = document.createElement("div");
    chatWindow.style.position = "fixed";
    chatWindow.style.bottom = "0";
    chatWindow.style.left = "0";
    chatWindow.style.width = "300px";
    chatWindow.style.height = "400px";
    chatWindow.style.backgroundColor = "#fff";
    chatWindow.style.border = "1px solid #ccc";
    chatWindow.style.padding = "10px";
    chatWindow.style.overflowY = "auto";

    chatWindow.innerHTML = `
        <h3>Chat with ${friendName}</h3>
        <div id="chatMessages_${chatId}" style="height: 300px; overflow-y: scroll;"></div>
        <input type="text" id="chatInput_${chatId}" placeholder="Type a message..." style="width: 100%;">
        <button id="sendChat_${chatId}">Send</button>
    `;

    document.body.appendChild(chatWindow);
    loadChatMessages(chatId);

    // Attach event listener after appending to DOM
    document.getElementById(`sendChat_${chatId}`).addEventListener("click", async () => {
        const messageInput = document.getElementById(`chatInput_${chatId}`);
        const message = messageInput.value.trim();
        if (message) {
            await sendMessage(chatId, userId, message);
            messageInput.value = ""; // Clear input after sending
        }
    });
}

// // Send Message
// async function sendMessage(chatId, senderId, message) {
//     const chatRef = doc(db, "privateChats", chatId);

//     await updateDoc(chatRef, {
//         messages: arrayUnion({
//             senderId: senderId,
//             message: message,
//             timestamp: new Date().toISOString(),
//         }),
//     });

//     document.getElementById("chatInput").value = '';
//     loadChatMessages(chatId);
// }
async function sendMessage(chatId, senderId, message) {
    const chatRef = doc(db, "privateChats", chatId);

    await updateDoc(chatRef, {
        messages: arrayUnion({
            senderId: senderId,
            message: message,
            timestamp: new Date().toISOString(),
        }),
    });

    // Directly update the chat window instead of waiting for Firestore update
    const chatMessagesContainer = document.getElementById(`chatMessages_${chatId}`);
    if (chatMessagesContainer) {
        chatMessagesContainer.innerHTML += `
            <div style="text-align: right;">
                <span style="font-weight: bold;">You:</span>
                <p>${message}</p>
            </div>
        `;
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

// Load Chat Messages
// async function loadChatMessages(chatId) {
//     const chatRef = doc(db, "privateChats", chatId);
//     const chatSnap = await getDoc(chatRef);
//     const chatData = chatSnap.data();

//     const chatMessagesContainer = document.getElementById("chatMessages");
//     if (chatData && chatData.messages) {
//         chatMessagesContainer.innerHTML = chatData.messages
//             .map(msg => `
//                 <div style="text-align: ${msg.senderId === auth.currentUser.uid ? 'right' : 'left'};">
//                     <span style="font-weight: bold;">${msg.senderId === auth.currentUser.uid ? 'You' : 'Friend'}:</span>
//                     <p>${msg.message}</p>
//                 </div>
//             `)
//             .join('');

//         chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
//     }
// }


async function loadChatMessages(chatId) {
    const chatRef = doc(db, "privateChats", chatId);
    const chatSnap = await getDoc(chatRef);
    const chatData = chatSnap.data();

    const chatMessagesContainer = document.getElementById(`chatMessages_${chatId}`);
    if (chatMessagesContainer && chatData && chatData.messages) {
        chatMessagesContainer.innerHTML = chatData.messages
            .map(msg => `
                <div style="text-align: ${msg.senderId === auth.currentUser.uid ? 'right' : 'left'};">
                    <span style="font-weight: bold;">${msg.senderId === auth.currentUser.uid ? 'You' : 'Friend'}:</span>
                    <p>${msg.message}</p>
                </div>
            `)
            .join('');

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}