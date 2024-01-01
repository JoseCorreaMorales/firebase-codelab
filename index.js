// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
   getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc
  } from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

// Firebase project configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAlpZPHhDugjF_GI7XpA1rD5ss3L_E3_fo",
  authDomain: "fir-jose-codelab.firebaseapp.com",
  projectId: "fir-jose-codelab",
  storageBucket: "fir-jose-codelab.appspot.com",
  messagingSenderId: "438253878957",
  appId: "1:438253878957:web:04505fcf43e45d440c9024"
}

initializeApp(firebaseConfig);

auth = getAuth();
db = getFirestore();


async function main() {


  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };

  const ui = new firebaseui.auth.AuthUI(auth);

  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is signed in allows user to sign out
      signOut(auth);
    } else {
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  onAuthStateChanged(auth, user => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT'; 
      guestbookContainer.style.display = 'block';
      
    }else {
      startRsvpButton.textContent = 'RSVP';
      guestbookContainer.style.display = 'none';
    }
  })



  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid
    });
    input.value = '';
    return false;
  });



}
main();
