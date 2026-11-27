/* MY GAME BD: বাইরে নোটিফিকেশন (Firebase Cloud Messaging)
   এই ফাইলটা index.html এর পাশে রাখুন এবং index.html এর একদম শেষে
   </body> এর ঠিক আগে এই এক লাইন বসান:
   <script src="push.js"></script>
*/
(function () {
  const VAPID_KEY = "BJjNHz1jonFn7KBny3GSA659APdZlIHAPyvgXN8__NqubFtoXjPCV36u5kmF07iqXgOV5aZFREi_FZth_d93sUg";
  const V = "10.12.2";
  let ready = false;

  const wait = (f, ms, max) => new Promise(res => {
    const t0 = Date.now();
    (function k() {
      let v = null;
      try { v = f(); } catch (e) {}
      if (v) return res(v);
      if (Date.now() - t0 > (max || 60000)) return res(null);
      setTimeout(k, ms || 300);
    })();
  });

  const hasNotif = () => typeof Notification !== "undefined";
  const msgOK = () => {
    try {
      return hasNotif() && "serviceWorker" in navigator && window.firebase &&
        firebase.messaging && firebase.messaging.isSupported();
    } catch (e) { return false; }
  };
  const tok = () => { try { return localStorage.getItem("mgbd_tok"); } catch (e) { return null; } };
  const isOn = () => hasNotif() && Notification.permission === "granted" && !!tok();

  async function saveToken(u) {
    /* আলাদা scope দেওয়া হয়েছে, যাতে আগের sw.js এর সাথে ঝামেলা না হয় */
    const reg = await navigator.serviceWorker.register("firebase-messaging-sw.js", { scope: "firebase-cloud-messaging-push-scope" });
    const token = await firebase.messaging().getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) return false;
    await db.collection("mg_tokens").doc(token).set({
      uid: u.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    try { localStorage.setItem("mgbd_tok", token); } catch (e) {}
    return true;
  }

  function btnHtml() {
    const on = isOn();
    return '<button data-p="push"><i>📲</i><span>বাইরে নোটিফিকেশন<small>' +
      (on ? "চালু আছে" : "টিকটক/ইউটিউব চলার সময়ও উপরে দেখাবে, চালু করতে চাপুন") +
      '</small></span><b class="sw ' + (on ? "on" : "") + '"></b></button>';
  }

  function inject() {
    const snd = document.querySelector('.menu button[data-p="snd"]');
    if (snd && !document.querySelector('.menu button[data-p="push"]')) {
      snd.insertAdjacentHTML("afterend", btnHtml());
    }
  }

  function refreshBtn() {
    const old = document.querySelector('.menu button[data-p="push"]');
    if (old) old.remove();
    inject();
  }

  async function enable() {
    if (!hasNotif() || !("serviceWorker" in navigator)) {
      return toast("এই ব্রাউজারে বাইরের নোটিফিকেশন চলবে না। iPhone হলে আগে অ্যাপটা হোম স্ক্রিনে ইনস্টল করুন", 4500);
    }
    if (!ready || !msgOK()) return toast("একটু পরে আবার চেষ্টা করুন, নোটিফিকেশন সিস্টেম লোড হচ্ছে", 3500);
    if (Notification.permission === "denied") {
      return toast("ব্রাউজার সেটিংস থেকে এই সাইটের নোটিফিকেশন অনুমতি দিন", 4000);
    }
    try {
      const p = await Notification.requestPermission();
      if (p !== "granted") return toast("অনুমতি দেওয়া হয়নি");
      if (!auth || !auth.currentUser) return toast("আগে লগইন করুন");
      await saveToken(auth.currentUser);
      toast("বাইরের নোটিফিকেশন চালু হয়েছে ✅");
      refreshBtn();
    } catch (e) {
      console.error("push", e);
      toast("চালু করা যায়নি, আবার চেষ্টা করুন", 3500);
    }
  }

  async function init() {
    await wait(() => window.firebase && firebase.apps && firebase.apps.length &&
      typeof auth !== "undefined" && auth && typeof db !== "undefined" && db);
    if (!window.firebase) return;
    try {
      await loadJs([
        "https://www.gstatic.com/firebasejs/" + V + "/firebase-messaging-compat.js",
        "https://cdnjs.cloudflare.com/ajax/libs/firebase/" + V + "/firebase-messaging-compat.min.js",
        "https://cdn.jsdelivr.net/npm/firebase@" + V + "/firebase-messaging-compat.js"
      ]);
    } catch (e) { return; }
    ready = true;

    /* লগইন হলে, আগে অনুমতি দেওয়া থাকলে চুপচাপ টোকেন আপডেট */
    auth.onAuthStateChanged(u => {
      if (u && msgOK() && Notification.permission === "granted") {
        saveToken(u).then(refreshBtn).catch(() => {});
      } else { refreshBtn(); }
    });

    /* লগআউটের সময় এই ফোনের টোকেন মুছে দেওয়া */
    try {
      const so = auth.signOut.bind(auth);
      auth.signOut = async function () {
        try {
          const t = tok();
          if (t) { await db.collection("mg_tokens").doc(t).delete(); localStorage.removeItem("mgbd_tok"); }
        } catch (e) {}
        return so();
      };
    } catch (e) {}
  }

  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest('button[data-p="push"]');
    if (b) enable();
  });

  const app = document.getElementById("app");
  if (app) new MutationObserver(inject).observe(app, { childList: true });
  init();
})();
