document.addEventListener("DOMContentLoaded", () => {
    const dropdownBtn = document.getElementById("dropdown");
    const sidebar = document.getElementById("sidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    dropdownBtn.addEventListener("click", () => {
        sidebar.classList.toggle("right-[-100%]");
        sidebar.classList.toggle("right-0");
    });

    closeSidebar.addEventListener("click", () => {
        sidebar.classList.add("right-[-100%]");
        sidebar.classList.remove("right-0");
    });
});
document.getElementById("open-private-chat").addEventListener("click", () => {
    const chatFriendId = localStorage.getItem("chatFriendId");
    const chatFriendName = localStorage.getItem("chatFriendName");

    if (chatFriendId) {
        openChat(chatFriendId, chatFriendName);
    } else {
        alert("No active chats. Start a chat from your Friend List.");
    }
});