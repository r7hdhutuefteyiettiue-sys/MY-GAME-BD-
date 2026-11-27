/* এই ফাইলটা ওয়েবসাইটের রুট ফোল্ডারে index.html এর পাশেই রাখুন
   নাম অবশ্যই: firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAn--yetHwRPIWsZfNCzanbwukG4InwQCo",
  authDomain: "gw-esports-9064a.firebaseapp.com",
  projectId: "gw-esports-9064a",
  storageBucket: "gw-esports-9064a.firebasestorage.app",
  messagingSenderId: "286918811222",
  appId: "1:286918811222:web:04fab49d38d3e6071125f7"
});

/* অ্যাপ বন্ধ বা ব্যাকগ্রাউন্ডে থাকলে FCM নিজেই নোটিফিকেশন দেখায়,
   তাই আলাদা কোড লাগে না। শুধু messaging চালু রাখলেই হবে। */
firebase.messaging();
