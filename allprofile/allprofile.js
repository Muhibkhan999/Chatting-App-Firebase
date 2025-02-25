          import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
          import {
              getAuth,
              onAuthStateChanged
          } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
          import {
              getFirestore,
              collection,
              getDocs,
              doc,
              setDoc,
              getDoc,
              updateDoc,
              arrayUnion,
              arrayRemove
          } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

          const firebaseConfig = {
              apiKey: "AIzaSyDyyKEfco7HvaLuvWC3RYkMnyER2SjBdX4",
              authDomain: "students-data-d86ad.firebaseapp.com",
              projectId: "students-data-d86ad",
              storageBucket: "students-data-d86ad.firebasestorage.app",
              messagingSenderId: "202639565303",
              appId: "1:202639565303:web:a37ac7b15f3a960d4fcef2",
          };

          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const db = getFirestore(app);

          const profileContainer = document.createElement("div");
          profileContainer.style.display = "flex";
          profileContainer.style.flexWrap = "wrap";
          profileContainer.style.justifyContent = "center";
          profileContainer.style.gap = "20px";
          profileContainer.style.padding = "20px";
          profileContainer.style.transition = "all 0.3s ease";
          document.body.appendChild(profileContainer);

          const style = document.createElement("style");
          style.innerHTML = `
              body {
                  font-family: 'Segoe UI', Arial, sans-serif;
                  background: linear-gradient(to right, #f8f9fa, #e6e9ef);
                  transition: all 0.3s ease;
                  text-align: center;
              }

              .profile-card {
                  width: 320px;
                  padding: 20px;
                  border-radius: 15px;
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                  text-align: center;
                  transition: all 0.3s ease;
              }

              .profile-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
              }

              .profile-pic {
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  border: 3px solid #6C5CE7;
                  box-shadow: 0 0 10px rgba(108, 92, 231, 0.3);
                  margin-bottom: 15px;
                  object-fit: cover;
              }

              .profile-name {
                  color: #2c3e50;
                  font-size: 1.5rem;
              }

              .profile-info {
                  color: #34495e;
                  font-size: 1rem;
                  margin: 5px 0;
              }

              .update-btn, .friend-request-btn {
                  padding: 10px 20px;
                  border-radius: 25px;
                  background-color: #6C5CE7;
                  color: white;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  margin: 5px;
              }

              .update-btn:hover, .friend-request-btn:hover {
                  background-color: #00B894;
                  transform: scale(1.05);
              }

              .dark-mode {
                  background: linear-gradient(to right, #2D3436, #34495E);
                  color: white;
              }

              .dark-mode .profile-card {
                  background: rgba(255, 255, 255, 0.15);
                  backdrop-filter: blur(12px);
                  color: white;
              }

              .dark-mode .profile-pic {
                  border-color: #FF7675;
                  box-shadow: 0 0 10px rgba(255, 118, 117, 0.3);
              }

              .dark-mode .profile-name,
              .dark-mode .profile-info {
                  color: #FFFFFF;
              }

              .dark-mode .update-btn,
              .dark-mode .friend-request-btn {
                  background-color: #FF7675;
              }

              .dark-mode .update-btn:hover,
              .dark-mode .friend-request-btn:hover {
                  background-color: #6C5CE7;
              }

              #themeToggle {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #6C5CE7;
                  color: white;
                  padding: 10px;
                  border: none;
                  border-radius: 50%;
                  cursor: pointer;
                  font-size: 1.25rem;
                  transition: all 0.3s ease;
                  z-index: 1000;
              }

              #themeToggle:hover {
                  background: #00B894;
                  transform: scale(1.1);
              }
          `;
          document.head.appendChild(style);

          const themeToggle = document.createElement("button");
          themeToggle.innerText = "🌙";
          themeToggle.id = "themeToggle";
          document.body.appendChild(themeToggle);

          themeToggle.addEventListener("click", () => {
              document.body.classList.toggle("dark-mode");
              themeToggle.innerText = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
          });

          const createProfileCard = (userData, userId, currentUser) => {
              if (currentUser.uid === userId) return;

              const card = document.createElement("div");
              card.classList.add("profile-card");
              card.innerHTML = `
                  <img src="${userData.profileImage || "https://static.vecteezy.com/system/resources/thumbnails/035/857/409/small/people-face-avatar-icon-cartoon-character-png.png"}" class="profile-pic">
                  <h3 class="profile-name">${userData.displayName || "No Name"}</h3>
                  <p class="profile-info">📅 Age: ${userData.age || "Not Provided"}</p>
                  <p class="profile-info">📍 City: ${userData.city || "Not Provided"}</p>
                  <p class="profile-info">🎓 Education: ${userData.education || "Not Provided"}</p>
                  <p class="profile-info">📧 Email: ${userData.email || "Not Provided"}</p>
                  <p class="profile-info">💬 About Me: ${userData.aboutMe || "Not Provided"}</p>
                  <button class="update-btn">Update Profile</button>
                  <button class="friend-request-btn">Send Friend Request</button>
              `;

              const updateBtn = card.querySelector(".update-btn");
              const friendRequestBtn = card.querySelector(".friend-request-btn");

              updateBtn.addEventListener("click", async () => {
                  const city = prompt("Enter your city:", userData.city || "");
                  const aboutMe = prompt("Tell something about yourself:", userData.aboutMe || "");
                  const education = prompt("Enter your education details:", userData.education || "");
                  const profileImage = prompt("Enter profile image URL:", userData.profileImage || "");

                  await setDoc(doc(db, "students", userId), { city, aboutMe, education, profileImage }, { merge: true });
                  
                  card.querySelector(".profile-info:nth-child(3)").innerText = `📍 City: ${city || "Not Provided"}`;
                  card.querySelector(".profile-info:nth-child(6)").innerText = `💬 About Me: ${aboutMe || "Not Provided"}`;
                  card.querySelector(".profile-info:nth-child(4)").innerText = `🎓 Education: ${education || "Not Provided"}`;
                  card.querySelector(".profile-pic").src = profileImage || "https://static.vecteezy.com/system/resources/thumbnails/035/857/409/small/people-face-avatar-icon-cartoon-character-png.png";

                  alert("Profile updated successfully!");
              });

              friendRequestBtn.addEventListener("click", async () => {
                  const requestRef = doc(db, "friendRequests", userId);
                  const requestSnap = await getDoc(requestRef);
                  let requests = requestSnap.exists() ? requestSnap.data().requests || [] : [];

                  if (!requests.includes(currentUser.uid)) {
                      requests.push(currentUser.uid);
                      await setDoc(requestRef, { requests }, { merge: true });
                      alert("Friend request sent!");
                  } else {
                      alert("Friend request already sent.");
                  }
              });

              profileContainer.appendChild(card);

              const checkFriendRequests = async () => {
                  const requestRef = doc(db, "friendRequests", currentUser.uid);
                  const requestSnap = await getDoc(requestRef);

                  if (requestSnap.exists()) {
                      const requests = requestSnap.data().requests || [];
                      if (requests.includes(userId)) {
                          if (confirm(`Accept friend request from ${userData.displayName}?`)) {
                              await updateDoc(doc(db, "friends", currentUser.uid), { friends: arrayUnion(userId) }, { merge: true });
                              await updateDoc(doc(db, "friends", userId), { friends: arrayUnion(currentUser.uid) }, { merge: true });

                              const newRequests = requests.filter(uid => uid !== userId);
                              await setDoc(requestRef, { requests: newRequests });

                              alert("Friend request accepted!");
                              openPrivateChat(userId, userData.displayName);
                          }
                      }
                  }
              };

              checkFriendRequests();
          };

          const openPrivateChat = (friendId, friendName) => {
              const chatWindow = document.createElement("div");
              chatWindow.style.position = "fixed";
              chatWindow.style.bottom = "20px";
              chatWindow.style.left = "20px";
              chatWindow.style.width = "300px";
              chatWindow.style.height = "400px";
              chatWindow.style.backgroundColor = "#fff";
              chatWindow.style.border = "none";
              chatWindow.style.borderRadius = "15px";
              chatWindow.style.padding = "15px";
              chatWindow.style.overflowY = "auto";
              chatWindow.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
              chatWindow.innerHTML = `
                  <h3 style="color: #2c3e50; margin-bottom: 15px;">Chat with ${friendName}</h3>
                  <div id="chatMessages" style="height: 280px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 10px;"></div>
                  <input type="text" id="chatInput" placeholder="Type a message..." style="width: 100%; padding: 10px; margin-top: 10px; border: 1px solid #dee2e6; border-radius: 20px; outline: none;">
                  <button id="sendChat" style="width: 100%; padding: 10px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">Send</button>
              `;
              document.body.appendChild(chatWindow);
          };

          onAuthStateChanged(auth, async (user) => {
              if (user) {
                  const querySnapshot = await getDocs(collection(db, "students"));
                  querySnapshot.forEach(doc => createProfileCard(doc.data(), doc.id, user));
              } else {
                  window.location.href = "index.html";
              }
          });