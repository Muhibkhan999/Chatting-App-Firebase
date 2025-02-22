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
          profileContainer.style.background = "linear-gradient(to right, #f0f2f5, #e6e9ef)";
          document.body.appendChild(profileContainer);

          // Function to create profile cards
          const createProfileCard = (userData, userId, currentUser) => {
              if (currentUser.uid === userId) return; // Don't show the current user's profile

              const card = document.createElement("div");
              card.style.textAlign = "center";
              card.style.border = "none";
              card.style.padding = "25px";
              card.style.width = "280px";
              card.style.margin = "10px";
              card.style.borderRadius = "15px";
              card.style.backgroundColor = "#ffffff";
              card.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
              card.style.cursor = "pointer";

              card.addEventListener('mouseenter', () => {
                  card.style.transform = "translateY(-5px)";
                  card.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
              });

              card.addEventListener('mouseleave', () => {
                  card.style.transform = "translateY(0)";
                  card.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              });

              const profilePic = document.createElement("img");
              profilePic.src = userData.profileImage || "https://static.vecteezy.com/system/resources/thumbnails/035/857/409/small/people-face-avatar-icon-cartoon-character-png.png";
              profilePic.style.width = "100px";
              profilePic.style.height = "100px";
              profilePic.style.borderRadius = "50%";
              profilePic.style.border = "3px solid #007bff";
              profilePic.style.padding = "3px";
              profilePic.style.marginBottom = "15px";
              profilePic.style.objectFit = "cover";

              const userName = document.createElement("h3");
              userName.innerText = `Name: ${userData.displayName}`;
              userName.style.color = "#2c3e50";
              userName.style.marginBottom = "15px";
              userName.style.fontSize = "1.2em";

              const userAge = document.createElement("p");
              userAge.innerText = `Age: ${userData.age}`;
              userAge.style.color = "#34495e";
              userAge.style.margin = "8px 0";

              const userEmail = document.createElement("p");
              userEmail.innerText = `Email: ${userData.email}`;
              userEmail.style.color = "#34495e";
              userEmail.style.margin = "8px 0";

              const userCity = document.createElement("p");
              userCity.innerText = `City: ${userData.city || "Not Provided"}`;
              userCity.style.color = "#34495e";
              userCity.style.margin = "8px 0";

              const userAbout = document.createElement("p");
              userAbout.innerText = `About Me: ${userData.aboutMe || "Not Provided"}`;
              userAbout.style.color = "#34495e";
              userAbout.style.margin = "8px 0";

              const userEducation = document.createElement("p");
              userEducation.innerText = `Education: ${userData.education || "Not Provided"}`;
              userEducation.style.color = "#34495e";
              userEducation.style.margin = "8px 0";

              const updateBtn = document.createElement("button");
              updateBtn.innerText = "Update Profile";
              updateBtn.style.marginTop = "15px";
              updateBtn.style.padding = "10px 20px";
              updateBtn.style.backgroundColor = "#007bff";
              updateBtn.style.color = "#fff";
              updateBtn.style.border = "none";
              updateBtn.style.cursor = "pointer";
              updateBtn.style.borderRadius = "25px";
              updateBtn.style.fontWeight = "bold";
              updateBtn.style.transition = "background-color 0.3s ease";

              updateBtn.addEventListener('mouseenter', () => {
                  updateBtn.style.backgroundColor = "#0056b3";
              });

              updateBtn.addEventListener('mouseleave', () => {
                  updateBtn.style.backgroundColor = "#007bff";
              });

              const friendRequestBtn = document.createElement("button");
              friendRequestBtn.innerText = "Send Friend Request";
              friendRequestBtn.style.marginTop = "10px";
              friendRequestBtn.style.padding = "10px 20px";
              friendRequestBtn.style.backgroundColor = "#28a745";
              friendRequestBtn.style.color = "#fff";
              friendRequestBtn.style.border = "none";
              friendRequestBtn.style.cursor = "pointer";
              friendRequestBtn.style.borderRadius = "25px";
              friendRequestBtn.style.fontWeight = "bold";
              friendRequestBtn.style.transition = "background-color 0.3s ease";

              friendRequestBtn.addEventListener('mouseenter', () => {
                  friendRequestBtn.style.backgroundColor = "#218838";
              });

              friendRequestBtn.addEventListener('mouseleave', () => {
                  friendRequestBtn.style.backgroundColor = "#28a745";
              });

              card.append(profilePic, userName, userAge, userEmail, userCity, userAbout, userEducation, updateBtn, friendRequestBtn);
              profileContainer.appendChild(card);

              updateBtn.addEventListener("click", async () => {
                  const city = prompt("Enter your city:", userData.city || "");
                  const aboutMe = prompt("Tell something about yourself:", userData.aboutMe || "");
                  const education = prompt("Enter your education details:", userData.education || "");
                  const profileImage = prompt("Enter profile image URL:", userData.profileImage || "");

                  await setDoc(doc(db, "students", userId), { city, aboutMe, education, profileImage }, { merge: true });

                  userCity.innerText = `City: ${city || "Not Provided"}`;
                  userAbout.innerText = `About Me: ${aboutMe || "Not Provided"}`;
                  userEducation.innerText = `Education: ${education || "Not Provided"}`;
                  profilePic.src = profileImage || "https://static.vecteezy.com/system/resources/thumbnails/035/857/409/small/people-face-avatar-icon-cartoon-character-png.png";

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