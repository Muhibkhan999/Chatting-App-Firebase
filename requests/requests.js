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
                    continue;
                }

                const friendName = friendData.displayName || "Unknown User";
                const requestMessage = document.createElement("div");
                requestMessage.className = "request-item";
                requestMessage.innerHTML = `<span class="friend-name">${friendName} sent you a friend request.</span>`;

                // Accept Button
                const acceptBtn = document.createElement("button");
                acceptBtn.className = "accept-btn";
                acceptBtn.innerText = "Accept";
                acceptBtn.addEventListener("click", async () => {
                    await acceptFriendRequest(userId, friendId, friendName);
                });

                // Reject Button
                const rejectBtn = document.createElement("button");
                rejectBtn.className = "reject-btn";
                rejectBtn.innerText = "Reject";
                rejectBtn.addEventListener("click", async () => {
                    await rejectFriendRequest(userId, friendId);
                });

                const buttonContainer = document.createElement("div");
                buttonContainer.className = "button-container";
                buttonContainer.appendChild(acceptBtn);
                buttonContainer.appendChild(rejectBtn);
                requestMessage.appendChild(buttonContainer);
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

        await updateDoc(userFriendsRef, { friends: arrayUnion(friendId) }).catch(async () => {
            await setDoc(userFriendsRef, { friends: [friendId] });
        });
        await updateDoc(friendFriendsRef, { friends: arrayUnion(userId) }).catch(async () => {
            await setDoc(friendFriendsRef, { friends: [userId] });
        });

        await updateDoc(userRequestsRef, { requests: arrayRemove(friendId) }).catch(async () => {
            await setDoc(userRequestsRef, { requests: [] });
        });

        console.log(`Friend request from ${friendId} accepted!`);
        openPrivateChat(userId, friendId, friendName);
    } catch (error) {
        console.error("Error accepting friend request:", error);
    }
}

// Reject Friend Request
async function rejectFriendRequest(userId, friendId) {
    try {
        const userRequestsRef = doc(db, "friendRequests", userId);
        const friendRequestsRef = doc(db, "friendRequests", friendId);

        await updateDoc(userRequestsRef, { requests: arrayRemove(friendId) }).catch(async () => {
            await setDoc(userRequestsRef, { requests: [] });
        });

        alert("Friend request rejected.");

        await updateDoc(friendRequestsRef, { rejectedRequests: arrayUnion(userId) }).catch(async () => {
            await setDoc(friendRequestsRef, { rejectedRequests: [userId] });
        });

        console.log(`Friend request from ${friendId} rejected.`);
    } catch (error) {
        console.error("Error rejecting friend request:", error);
    }
}

async function openPrivateChat(userId, friendId, friendName) {
    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const chatRef = doc(db, "privateChats", chatId);

    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [] });
    }

    const chatWindow = document.createElement("div");
    chatWindow.className = "chat-window";
    chatWindow.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 450px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    chatWindow.innerHTML = `
        <div class="chat-header" style="
            padding: 15px;
            background-color: #4a90e2;
            color: white;
            font-weight: bold;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <h3 style="margin: 0;">${friendName}</h3>
            <button class="close-chat" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
            ">×</button>
        </div>
        <div id="chatMessages_${chatId}" style="
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f5f5f5;
        "></div>
        <div class="chat-input-container" style="
            padding: 15px;
            background-color: #ffffff;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        ">
            <input type="text" id="chatInput_${chatId}" style="
                flex: 1;
                padding: 10px;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                outline: none;
            " placeholder="Type a message...">
            <button id="sendChat_${chatId}" style="
                background-color: #4a90e2;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 10px 20px;
                cursor: pointer;
                transition: background-color 0.2s;
            ">Send</button>
        </div>
    `;

    document.body.appendChild(chatWindow);
    loadChatMessages(chatId);

    // Close button functionality
    chatWindow.querySelector('.close-chat').addEventListener('click', () => {
        chatWindow.remove();
    });

    // Send button functionality
    document.getElementById(`sendChat_${chatId}`).addEventListener("click", async () => {
        const messageInput = document.getElementById(`chatInput_${chatId}`);
        const message = messageInput.value.trim();
        if (message) {
            await sendMessage(chatId, userId, message);
            messageInput.value = "";
        }
    });

    // Enter key functionality
    document.getElementById(`chatInput_${chatId}`).addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            const messageInput = document.getElementById(`chatInput_${chatId}`);
            const message = messageInput.value.trim();
            if (message) {
                await sendMessage(chatId, userId, message);
                messageInput.value = "";
            }
        }
    });
}

async function sendMessage(chatId, senderId, message) {
    const chatRef = doc(db, "privateChats", chatId);

    await updateDoc(chatRef, {
        messages: arrayUnion({
            senderId: senderId,
            message: message,
            timestamp: new Date().toISOString(),
        }),
    });

    const chatMessagesContainer = document.getElementById(`chatMessages_${chatId}`);
    if (chatMessagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.style.cssText = `
            margin: 10px 0;
            padding: 10px 15px;
            background-color: #4a90e2;
            color: white;
            border-radius: 18px;
            max-width: 70%;
            word-wrap: break-word;
            align-self: flex-end;
            margin-left: auto;
        `;
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time" style="
                font-size: 0.8em;
                opacity: 0.8;
                margin-top: 4px;
            ">${new Date().toLocaleTimeString()}</div>
        `;
        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

async function loadChatMessages(chatId) {
    const chatRef = doc(db, "privateChats", chatId);
    const chatSnap = await getDoc(chatRef);
    const chatData = chatSnap.data();

    const chatMessagesContainer = document.getElementById(`chatMessages_${chatId}`);
    if (chatMessagesContainer && chatData && chatData.messages) {
        chatMessagesContainer.innerHTML = chatData.messages
            .map(msg => {
                const isCurrentUser = msg.senderId === auth.currentUser.uid;
                const messageTime = new Date(msg.timestamp).toLocaleTimeString();
                return `
                    <div class="message ${isCurrentUser ? 'sent' : 'received'}" style="
                        margin: 10px 0;
                        padding: 10px 15px;
                        background-color: ${isCurrentUser ? '#4a90e2' : '#e9ecef'};
                        color: ${isCurrentUser ? 'white' : 'black'};
                        border-radius: 18px;
                        max-width: 70%;
                        word-wrap: break-word;
                        ${isCurrentUser ? 'margin-left: auto;' : 'margin-right: auto;'}
                    ">
                        <div class="message-content">${msg.message}</div>
                        <div class="message-time" style="
                            font-size: 0.8em;
                            opacity: 0.8;
                            margin-top: 4px;
                        ">${messageTime}</div>
                    </div>
                `;
            })
            .join('');

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}