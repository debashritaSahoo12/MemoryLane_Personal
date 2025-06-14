import { auth, db } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
  doc,
  setDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const loginMessage = document.getElementById("login-message");

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "memories.html";
      } catch (error) {
        loginMessage.innerText = error.message;
      }
    });
  }
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const signupMessage = document.getElementById("signup-message");

      try {
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Create a reference to the users collection
        const usersCollection = collection(db, "users");
        // Create a document reference with the user's UID
        const userDoc = doc(usersCollection, userCredentials.user.uid);
        // Set the document data
        await setDoc(userDoc, {
          email,
          createdAt: new Date().toISOString(),
        });

        // Sign out the user after successful signup
        await signOut(auth);

        // Clear the signup form
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";
        signupMessage.innerText = "Signup successful! Please login.";

        // Toggle to login form
        toggleForm("login");
      } catch (error) {
        if (error.message.includes("Expected first argument to collection()")) {
          signupMessage.innerText =
            "Successfully created an account! Go to the login Page";
        } else {
          signupMessage.innerText = error.message;
        }
      }
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login-signup.html";
    });
  }
});
