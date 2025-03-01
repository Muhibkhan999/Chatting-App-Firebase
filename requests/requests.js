import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbcT2Dbv_gGvejEraqEmTRpjWfP_INZo0",
    authDomain: "first-project-ed208.firebaseapp.com",
    projectId: "first-project-ed208",
    storageBucket: "first-project-ed208.firebasestorage.app",
    messagingSenderId: "724413631751",
    appId: "1:724413631751:web:4bac7ed9cd9c80212a89a2",
    measurementId: "G-6HJ83XTGP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Track open chat windows
const openChatWindows = new Set();

// Get the logged-in user
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        await loadFriendRequests(userId);
    }
});

// Load friend requests
async function loadFriendRequests(userId) {
    const requestsRef = doc(db, "friendRequests", userId);
    const requestsSnap = await getDoc(requestsRef);

    if (requestsSnap.exists()) {
        const requestsData = requestsSnap.data();
        const requests = requestsData.requests || [];
        displayFriendRequests(userId, requests);
    } else {
        console.log("No friend requests found.");
    }
}

// Display friend requests
async function displayFriendRequests(userId, requests) {
    const requestsList = document.getElementById("requestsList");
    requestsList.innerHTML = "";

    for (const friendId of requests) {
        const friendData = await getUserData(friendId);
        if (!friendData) continue;

        const friendName = friendData.displayName || "Unknown User";
        const requestMessage = document.createElement("div");
        requestMessage.className = "request-item";
        requestMessage.innerHTML = `<span class="friend-name">${friendName} sent you a friend request.</span>`;

        const acceptBtn = createButton("Accept", "accept-btn", () => acceptFriendRequest(userId, friendId, friendName));
        const rejectBtn = createButton("Reject", "reject-btn", () => rejectFriendRequest(userId, friendId));

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.appendChild(acceptBtn);
        buttonContainer.appendChild(rejectBtn);
        requestMessage.appendChild(buttonContainer);
        requestsList.appendChild(requestMessage);
    }
}

// Create a button
function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.innerText = text;
    button.addEventListener("click", onClick);
    return button;
}

// Get user data
async function getUserData(userId) {
    const userRef = doc(db, "students", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
}

// Accept friend request
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

// Reject friend request
async function rejectFriendRequest(userId, friendId) {
    try {
        const userRequestsRef = doc(db, "friendRequests", userId);
        const friendRequestsRef = doc(db, "friendRequests", friendId);

        await updateDoc(userRequestsRef, { requests: arrayRemove(friendId) }).catch(async () => {
            await setDoc(userRequestsRef, { requests: [] });
        });

        await updateDoc(friendRequestsRef, { rejectedRequests: arrayUnion(userId) }).catch(async () => {
            await setDoc(friendRequestsRef, { rejectedRequests: [userId] });
        });

        alert("Friend request rejected.");
        console.log(`Friend request from ${friendId} rejected.`);
    } catch (error) {
        console.error("Error rejecting friend request:", error);
    }
}

// Open private chat
async function openPrivateChat(userId, friendId, friendName) {
    if (openChatWindows.has(friendId)) {
        alert(`Chat with ${friendName} is already open.`);
        return;
    }

    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const chatRef = doc(db, "privateChats", chatId);

    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [] });
    }

    const chatWindow = createChatWindow(friendName, chatId);
    document.body.appendChild(chatWindow);
    openChatWindows.add(friendId);

    loadChatMessages(chatId);

    // Close button functionality
    chatWindow.querySelector('.close-chat').addEventListener('click', () => {
        chatWindow.remove();
        openChatWindows.delete(friendId);
    });

    // Send button functionality
    document.getElementById(`sendChat_${chatId}`).addEventListener("click", async () => {
        await sendMessage(chatId, userId);
    });

    // Enter key functionality
    document.getElementById(`chatInput_${chatId}`).addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            await sendMessage(chatId, userId);
        }
    });
}

// Create chat window
function createChatWindow(friendName, chatId) {
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
        animation: slideIn 0.3s ease;
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

    return chatWindow;
}

// Send message
async function sendMessage(chatId, userId) {
    const messageInput = document.getElementById(`chatInput_${chatId}`);
    const message = messageInput.value.trim();
    if (!message) return;

    const chatRef = doc(db, "privateChats", chatId);

    await updateDoc(chatRef, {
        messages: arrayUnion({
            senderId: userId,
            message: message,
            timestamp: new Date().toISOString(),
        }),
    });

    messageInput.value = "";
    loadChatMessages(chatId);
}

// Load chat messages
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