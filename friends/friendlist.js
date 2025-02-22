
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, collection, addDoc, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
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

























// ✅ Ensure openPrivateChat is globally available
window.openPrivateChat = async function(userId, friendId, friendName) {
    console.log(`Opening chat with ${friendName} (${friendId})`);

    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    
    let chatWindow = document.getElementById(`chatWindow_${chatId}`);
    if (!chatWindow) {
        chatWindow = document.createElement("div");
        chatWindow.id = `chatWindow_${chatId}`;
        chatWindow.style.position = "fixed";
        chatWindow.style.bottom = "0";
        chatWindow.style.left = "0";
        chatWindow.style.width = "300px";
        chatWindow.style.height = "400px";
        chatWindow.style.backgroundColor = "#fff";
        chatWindow.style.border = "1px solid #ccc";
        chatWindow.style.padding = "10px";
        chatWindow.style.overflowY = "auto";
        chatWindow.style.zIndex = "1000";

        chatWindow.innerHTML = `
            <h3>Chat with ${friendName}</h3>
            <div id="chatMessages_${chatId}" style="height: 300px; overflow-y: scroll;"></div>
            <input type="text" id="chatInput_${chatId}" placeholder="Type a message..." style="width: 100%;">
            <button class="sendChatBtn" data-chatid="${chatId}" data-userid="${userId}">Send</button>
        `;
        document.body.appendChild(chatWindow);

        // Attach event listener to the send button
        document.querySelector(`.sendChatBtn[data-chatid='${chatId}']`).addEventListener("click", async function() {
            const message = document.getElementById(`chatInput_${chatId}`).value;
            if (message.trim() !== "") {
                await sendMessage(chatId, userId, message);
            }
        });

        await loadChatMessages(chatId);
    }
};

async function loadChatMessages(chatId) {
    const chatMessagesContainer = document.getElementById(`chatMessages_${chatId}`);
    if (!chatMessagesContainer) return;

    const chatRef = doc(db, "privateChats", chatId);

    onSnapshot(chatRef, (chatSnap) => {
        if (chatSnap.exists()) {
            const chatData = chatSnap.data();

            // 🔹 FIX: Clear messages before re-rendering to avoid duplicates
            chatMessagesContainer.innerHTML = "";

            chatData.messages.forEach(msg => {
                chatMessagesContainer.innerHTML += `
                    <div style="text-align: ${msg.senderId === auth.currentUser.uid ? 'right' : 'left'};">
                        <span style="font-weight: bold;">${msg.senderId === auth.currentUser.uid ? 'You' : 'Friend'}:</span>
                        <p>${msg.message}</p>
                    </div>
                `;
            });

            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    });
}

async function sendMessage(chatId, senderId, message) {
    const chatRef = doc(db, "privateChats", chatId);

    // 🔹 Ensure the chat document exists before updating
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [] });  // Create empty messages array if not exists
    }

    await updateDoc(chatRef, {
        messages: arrayUnion({
            senderId: senderId,
            message: message,
            timestamp: new Date().toISOString(),
        }),
    });

    // 🔹 FIX: Remove manual UI message appending (Firestore will handle it)
    
    document.getElementById(`chatInput_${chatId}`).value = '';
}




// Create Group
document.getElementById("createGroupBtn").addEventListener("click", async () => {
    if (selectedFriends.length < 2) {
        alert("Select at least two friends to create a group.");
        return;
    }

    const groupName = document.getElementById("groupNameInput").value.trim();
    if (!groupName) {
        alert("Enter a group name.");
        return;
    }

    const userId = auth.currentUser.uid;
    const groupMembers = selectedFriends.map(friend => friend.id);
    groupMembers.push(userId); // Include the current user in the group

    try {
        const groupRef = await addDoc(collection(db, "groups"), {
            groupName,
            members: groupMembers,
            messages: []
        });

        selectedFriends = [];
        groupMode = false;

        document.querySelectorAll(".groupSelectBtn").forEach(btn => {
            btn.style.display = "none";
            btn.textContent = "Select for Group";
        });

        document.getElementById("groupNameInput").value = "";
        document.getElementById("createGroupSection").style.display = "none";

        renderGroup(groupRef.id, groupName);
    } catch (error) {
        console.error("Error creating group:", error);
    }
});








let selectedFriends = [];
let groupMode = false;



// Load Friend List
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        const userFriendsRef = doc(db, "friends", userId);

        onSnapshot(userFriendsRef, async (docSnap) => {
            if (docSnap.exists()) {
                const friends = docSnap.data().friends || [];
                const friendsListContainer = document.getElementById("friendsList");
                friendsListContainer.innerHTML = "";

                for (const friendId of friends) {
                    const friendRef = doc(db, "students", friendId);
                    const friendSnap = await getDoc(friendRef);
                    const friendData = friendSnap.data();

                    if (friendData) {
                        const friendName = friendData.displayName || "Unknown Friend";
                        const friendItem = document.createElement("li");
                        friendItem.innerHTML = `
                            <span>${friendName}</span>
                            <button class="chatBtn" data-userid="${userId}" data-friendid="${friendId}" data-friendname="${friendName}">Chat</button>
                        `;
                        friendsListContainer.appendChild(friendItem);
                    }
                }

                // Attach event listeners to chat buttons dynamically
                document.querySelectorAll(".chatBtn").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const userId = event.target.getAttribute("data-userid");
                        const friendId = event.target.getAttribute("data-friendid");
                        const friendName = event.target.getAttribute("data-friendname");
                        openPrivateChat(userId, friendId, friendName);
                    });
                });
            } else {
                console.log("No friends found.");
            }
        });
    }
});
// Load Friend List & Groups
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;

        // Load Groups Where the User is a Member
        const groupsQuery = query(collection(db, "groups"), where("members", "array-contains", userId));
        const groupsSnapshot = await getDocs(groupsQuery);
        const groupListContainer = document.getElementById("groupList");
        groupListContainer.innerHTML = ""; // Clear previous list

        groupsSnapshot.forEach((docSnap) => {
            const groupData = docSnap.data();
            renderGroup(docSnap.id, groupData.groupName);
        });
    }
});

// Create Group
document.getElementById("createGroupBtn").addEventListener("click", async () => {
    if (selectedFriends.length < 2) {
        alert("Select at least two friends to create a group.");
        return;
    }

    const groupName = document.getElementById("groupNameInput").value.trim();
    if (!groupName) {
        alert("Enter a group name.");
        return;
    }

    const userId = auth.currentUser.uid;
    const groupMembers = selectedFriends.map(friend => friend.id);
    groupMembers.push(userId); // Include the current user in the group

    try {
        const groupRef = await addDoc(collection(db, "groups"), {
            groupName,
            members: groupMembers,
            messages: []
        });

        selectedFriends = [];
        groupMode = false;

        document.querySelectorAll(".groupSelectBtn").forEach(btn => {
            btn.style.display = "none";
            btn.textContent = "Select for Group";
        });

        document.getElementById("groupNameInput").value = "";
        document.getElementById("createGroupSection").style.display = "none";

        renderGroup(groupRef.id, groupName);
    } catch (error) {
        console.error("Error creating group:", error);
    }
});

// Render Group in List
function renderGroup(groupId, groupName) {
    const groupListContainer = document.getElementById("groupList");
    const groupItem = document.createElement("div");
    groupItem.textContent = groupName;
    groupItem.classList.add("groupItem");
    groupItem.dataset.groupid = groupId;
    groupItem.addEventListener("click", () => openGroupChat(groupId, groupName));
    groupListContainer.appendChild(groupItem);
}

// Open Group Chat Modal
function openGroupChat(groupId, groupName) {
    let chatModal = document.getElementById(`groupChat_${groupId}`);
    if (!chatModal) {
        chatModal = document.createElement("div");
        chatModal.id = `groupChat_${groupId}`;
        chatModal.classList.add("chatModal");
        chatModal.innerHTML = `
            <div class="chatModalContent">
                <span class="closeBtn" onclick="closeGroupChat('${groupId}')">&times;</span>
                <h3>${groupName}</h3>
                <div id="groupMessages_${groupId}" class="chatMessages"></div>
                <input type="text" id="groupInput_${groupId}" placeholder="Type a message...">
                <button id="sendBtn_${groupId}">Send</button>
            </div>
        `;
        document.body.appendChild(chatModal);
    }
    chatModal.style.display = "block";

    document.getElementById(`sendBtn_${groupId}`).addEventListener("click", () => sendGroupMessage(groupId));

    // Load Messages in Real-Time
    loadGroupMessages(groupId);
}

// Close Group Chat Modal
window.closeGroupChat = function (groupId) {
    const chatModal = document.getElementById(`groupChat_${groupId}`);
    if (chatModal) {
        chatModal.style.display = "none";
    }
};

// Send Message to Group
async function sendGroupMessage(groupId) {
    const inputField = document.getElementById(`groupInput_${groupId}`);
    const message = inputField.value.trim();
    if (!message) return;

    const userId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, "students", userId));
    const senderName = userDoc.exists() ? userDoc.data().displayName : "Unknown";

    const chatRef = doc(db, "groups", groupId);
    await updateDoc(chatRef, {
        messages: arrayUnion({
            senderId: userId,
            senderName,
            message,
            timestamp: new Date().toISOString()
        })
    });

    inputField.value = "";
}

// Load Group Messages in Real-Time
function loadGroupMessages(groupId) {
    const chatRef = doc(db, "groups", groupId);
    const messagesContainer = document.getElementById(`groupMessages_${groupId}`);

    onSnapshot(chatRef, (docSnap) => {
        if (docSnap.exists()) {
            messagesContainer.innerHTML = ""; // Clear previous messages
            const messages = docSnap.data().messages || [];

            messages.forEach((msg) => {
                const messageElement = document.createElement("div");
                messageElement.textContent = `${msg.senderName}: ${msg.message}`;
                messagesContainer.appendChild(messageElement);
            });
        }
    });
}


document.getElementById("makeGroupBtn").addEventListener("click", () => {
    groupMode = !groupMode; // Toggle group mode

    document.querySelectorAll(".chatBtn").forEach(chatBtn => {
        let friendId = chatBtn.getAttribute("data-friendid");
        let existingSelectBtn = document.querySelector(`.groupSelectBtn[data-friendid='${friendId}']`);

        if (!existingSelectBtn) {
            let selectBtn = document.createElement("button");
            selectBtn.classList.add("groupSelectBtn");
            selectBtn.textContent = "Select for Group";
            selectBtn.dataset.friendid = friendId;
            selectBtn.style.display = groupMode ? "inline-block" : "none";
            selectBtn.style.backgroundColor = "#4CAF50";
            selectBtn.style.color = "white";
            selectBtn.style.padding = "8px 16px";
            selectBtn.style.border = "none";
            selectBtn.style.borderRadius = "4px";
            selectBtn.style.cursor = "pointer";
            selectBtn.style.marginLeft = "10px";
            selectBtn.style.transition = "background-color 0.3s ease";

            selectBtn.addEventListener("click", function () {
                if (selectedFriends.some(friend => friend.id === friendId)) {
                    selectedFriends = selectedFriends.filter(friend => friend.id !== friendId);
                    selectBtn.textContent = "Select for Group";
                    selectBtn.style.backgroundColor = "#4CAF50";
                } else {
                    selectedFriends.push({ id: friendId });
                    selectBtn.textContent = "Selected";
                    selectBtn.style.backgroundColor = "#2196F3";
                }
            });

            chatBtn.parentNode.appendChild(selectBtn);
        } else {
            existingSelectBtn.style.display = groupMode ? "inline-block" : "none";
        }
    });

    document.getElementById("createGroupSection").style.display = groupMode ? "block" : "none";
});