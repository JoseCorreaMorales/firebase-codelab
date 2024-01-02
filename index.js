import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  where
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbookDiscussion = document.getElementById('guestbook-discussion');
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
      subscribeGuestbook();
      subscribeCurrentRsvp(user);

    } else {
      startRsvpButton.textContent = 'RSVP';
      guestbookContainer.style.display = 'none';
      unsubscribeGuestbook();
      unsubscribeCurrentRsvp();
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

  rsvpYes.addEventListener('click', async () => {
    const userRef = doc(db, 'attendees', auth.currentUser.uid);
    try {
      await setDoc(userRef, {
        attending: true
      });
    } catch (error) {
      console.log(error);
    }
  });


  rsvpNo.addEventListener('click', async () => {
    const userRef = doc(db, 'attendees', auth.currentUser.uid);
    try {
      await setDoc(userRef, {
        attending: false
      });
    } catch (error) {
      console.log(error);
    }
  });

  const attendingQuery = query(collection(db, 'attendees'), where('attending', '==', true));
  const unsubscribe = onSnapshot(attendingQuery, (snapshot) => {
    const newAttendeCount = snapshot.docs.length;
    numberAttending.innerHTML = newAttendeCount + ' people going';
  });

}
main();

function subscribeGuestbook() {
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestbookListener = onSnapshot(q, (snapshop) => {
    //when there are any changes to documents that match the query.
    // This could be if a message gets deleted, modified, or added. 
    guestbookDiscussion.innerHTML = '';
    snapshop.forEach((doc) => {
      const entry = document.createElement('div');
      entry.classList.add('guestbook-entry');
      entry.innerHTML += `<p><strong>${doc.data().name}</strong>: ${doc.data().text}</p>
      <sub>
      ${new Date(doc.data().timestamp).toLocaleDateString()}
      ${new Date(doc.data().timestamp).toLocaleTimeString()}
      </sub>`;
      guestbookDiscussion.appendChild(entry);
    });
  });
}
//new Date(doc.data().timestamp)
function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}

function subscribeCurrentRsvp(user) {
  const userRef = doc(db, 'attendees', user.uid);
  rsvpListener = onSnapshot(userRef, (doc) => {
    if (doc && doc.data()) {
      const attendingResponse = doc.data().attending;
      if (attendingResponse) {
        rsvpYes.className = 'clicked';
        rsvpNo.className = '';
      } else {
        rsvpYes.className = '';
        rsvpNo.className = 'clicked';
      }
    }
  });

}

function unsubscribeCurrentRsvp() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = '';
  rsvpNo.className = '';
}
