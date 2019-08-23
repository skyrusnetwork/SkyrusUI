import firebase from 'firebase'
var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyAHDalqaCROBeFRw3AKbFjNVo7pbRcIjA0",
  authDomain: "skyrus-3a8d7.firebaseapp.com",
  databaseURL: "https://skyrus-3a8d7.firebaseio.com",
  projectId: "skyrus-3a8d7",
  storageBucket: "skyrus-3a8d7.appspot.com",
  messagingSenderId: "989475644869"
};
var fire = firebase.initializeApp(config);
export default fire;
