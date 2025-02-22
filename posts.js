

// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
    getAuth, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
    getFirestore, 
    addDoc, 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy ,
    getDoc,  // ✅ Add this import
    doc,      // ✅ Add this import
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ Initialize Firebase (No need for firebaseConfig.js)
const firebaseConfig = {
    apiKey: "AIzaSyDyyKEfco7HvaLuvWC3RYkMnyER2SjBdX4",
    authDomain: "students-data-d86ad.firebaseapp.com",
    projectId: "students-data-d86ad",
    storageBucket: "students-data-d86ad.appspot.com",
    messagingSenderId: "202639565303",
    appId: "1:202639565303:web:a37ac7b15f3a960d4fcef2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Get the logged-in user ID
const loggedInUser = localStorage.getItem("userUID");

// ✅ Redirect to login if user is not logged in
if (!loggedInUser) {
    window.location.replace("./index.html");
}

// ✅ Get UI Elements
const postInput = document.querySelector("#post-inp");
const addPostBtn = document.querySelector("#add");
const myPostDiv = document.querySelector("#myPosts");
const allPostDiv = document.querySelector("#allPosts");
const logoutBtn = document.querySelector("#signOut");
// const createPost = async () => {
//     const text = postInput.value.trim();

//     if (!text) {
//         alert("Post cannot be empty!");
//         return;
//     }

//     try {
//         // ✅ Add the new post to Firestore
//         const postData = {
//             postText: text,
//             uid: loggedInUser,
//             createdAt: new Date()
//         };

//         const docRef = await addDoc(collection(db, "posts"), postData);

//         // ✅ Fetch user details only for the new post
//         const userDocRef = doc(db, "students", loggedInUser);
//         const userDocSnap = await getDoc(userDocRef);

//         let userName = "Unknown User";
//         let userEmail = "No Email";

//         if (userDocSnap.exists()) {
//             const userData = userDocSnap.data();
//             userName = userData.displayName || "Anonymous";
//             userEmail = userData.email || "No Email";
//         }

//         // ✅ Append the new post dynamically instead of reloading all posts
//         const newPostHTML = `
//             <div class="post">
//                 <p><strong>${userName} (${userEmail})</strong></p>
//                 <p>${text}</p>
//                 <hr>
//             </div>
//         `;

//         allPostDiv.innerHTML = newPostHTML + allPostDiv.innerHTML;

//         if (loggedInUser === postData.uid) {
//             myPostDiv.innerHTML = newPostHTML + myPostDiv.innerHTML;
//         }

//         postInput.value = ""; // Clear input field

//     } catch (error) {
//         console.error("Error adding post:", error);
//         alert("Failed to post. Try again!");
//     }
// };


// ✅ Fetch and display all posts with user details
const getAllPosts = async () => {
    // allPostDiv.innerHTML = "<h3>All Posts</h3>";

    try {
        const postsSnapshot = await getDocs(
            query(collection(db, "posts"), orderBy("createdAt", "desc"))
        );

        for (const docSnap of postsSnapshot.docs) {
            const post = docSnap.data();

            // Fetch user details from 'students' collection
            const userDocRef = doc(db, "students", post.uid);
            const userDocSnap = await getDoc(userDocRef);

            let userName = "Unknown User";
            let userEmail = "No Email";

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                userName = userData.displayName;
                userEmail = userData.email;
            }

            allPostDiv.innerHTML += `
                <div class="post">
                    <p><strong>${userName} (${userEmail})</strong></p>
                    <p>${post.postText}</p>
                    <hr>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
};

const createPost = async () => {
    const text = postInput.value.trim();

    if (!text) {
        alert("Post cannot be empty!");
        return;
    }

    try {
        // ✅ Add the new post to Firestore
        const postData = {
            postText: text,
            uid: loggedInUser,
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, "posts"), postData);

        // ✅ Fetch user details only for the new post
        const userDocRef = doc(db, "students", loggedInUser);
        const userDocSnap = await getDoc(userDocRef);

        let userName = "Unknown User";
        let userEmail = "No Email";

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userName = userData.displayName || "Anonymous";
            userEmail = userData.email || "No Email";
        }

        // ✅ Append the new post dynamically instead of reloading all posts
        const newPostHTML = `
            <div class="post">
                <p><strong>${userName} (${userEmail})</strong></p>
                <p>${text}</p>
                <hr>
            </div>
        `;

        allPostDiv.innerHTML = newPostHTML + allPostDiv.innerHTML;

        if (loggedInUser === postData.uid) {
            // ✅ Remove "No posts yet." if it exists
            const noPostMessage = myPostDiv.querySelector("#no-posts-message");
            if (noPostMessage) noPostMessage.remove();

            myPostDiv.innerHTML = `<p>${text}</p><hr>` + myPostDiv.innerHTML;
        }

        postInput.value = ""; // Clear input field

    } catch (error) {
        console.error("Error adding post:", error);
        alert("Failed to post. Try again!");
    }
};

// ✅ Fetch and display user's posts
const getMyPosts = async () => {
    try {
        const myPostsQuery = query(
            collection(db, "posts"),
            where("uid", "==", loggedInUser)
        );

        const myPostsSnapshot = await getDocs(myPostsQuery);

        if (myPostsSnapshot.empty) {
            myPostDiv.innerHTML = `<p id="no-posts-message">No posts yet.</p>`;
            return;
        }

        let myPostsHTML = "";
        myPostsSnapshot.forEach((doc) => {
            const post = doc.data();
            myPostsHTML += `<p>${post.postText}</p><hr>`;
        });

        myPostDiv.innerHTML = myPostsHTML;

    } catch (error) {
        console.error("Error fetching user's posts:", error);
    }
};

// const getMyPosts = async () => {


//     try {
//         // 🛠 Fix: Query Firestore correctly
//         const myPostsQuery = query(
//             collection(db, "posts"),
//             where("uid", "==", loggedInUser)
//         );

//         const myPostsSnapshot = await getDocs(myPostsQuery);

//         if (myPostsSnapshot.empty) {
//             myPostDiv.innerHTML += "<p>No posts yet.</p>";
//             return;
//         }

//         myPostsSnapshot.forEach((doc) => {
//             const post = doc.data();
//             myPostDiv.innerHTML += `<p>${post.postText}</p><hr>`;
//         });

//     } catch (error) {
//         console.error("Error fetching user's posts:", error);
//     }
// };



// ✅ Logout function
const logoutUser = async () => {
    await signOut(auth);
    localStorage.removeItem("userUID");
    window.location.replace("index.html") ||window.location.replace("../index.html");
};

// ✅ Event Listeners (After DOM is loaded)
document.addEventListener("DOMContentLoaded", () => {
    addPostBtn.addEventListener("click", createPost);
    logoutBtn.addEventListener("click", logoutUser);
    
    getAllPosts();
    getMyPosts();
});