// ============================================================
// みったーパズル オンラインランキング用 online2.js
// ボスラッシュ（scores_rush）と かちぬき（scores_kachi）の送受信。
// online.js（エンドレス／スコアアタック用）には触らず、
// window.HP_ONLINE に submitRush / topRush / submitKachi / topKachi を足す。
// ============================================================

const firebaseConfigChal = {
  apiKey: "AIzaSyBq_sGnzIjjqISNg0HH6jfuXEaq6ATMxMU",
  authDomain: "mitter-puzzle.firebaseapp.com",
  projectId: "mitter-puzzle",
  appId: "1:29089502139:web:0f6b8225d1ce7c272fea9e"
};

(function () {
  "use strict";

  var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
  var readyPromise = null;

  // Firebase の読みこみは 最初の submit / top のときだけ（遅延読みこみ）
  // online.js と アプリ名が かぶらないよう、名前つきアプリを使う
  function ready() {
    if (!readyPromise) {
      readyPromise = Promise.all([
        import(SDK + "firebase-app.js"),
        import(SDK + "firebase-firestore.js")
      ]).then(function (mods) {
        var app = mods[0].initializeApp(firebaseConfigChal, "mitter-chal");
        return { fs: mods[1], db: mods[1].getFirestore(app) };
      });
    }
    return readyPromise;
  }

  function cleanName(rec) {
    return String(rec.n == null ? "" : rec.n).slice(0, 10);
  }

  // ---- ボスラッシュ：クリアタイム（秒）の速い順 ----
  function cleanRush(rec) {
    return {
      n: cleanName(rec),
      t: Math.floor(Number(rec.t) || 0),
      h: String(rec.h || "hero"),
      d: String(rec.d || "")
    };
  }

  async function submitRush(rec) {
    var set = await ready();
    var fs = set.fs;
    var data = cleanRush(rec);
    data.ts = fs.serverTimestamp();
    await fs.addDoc(fs.collection(set.db, "scores_rush"), data);
  }

  async function topRush(limit) {
    var set = await ready();
    var fs = set.fs;
    var n = Math.max(1, Math.min(500, Math.floor(Number(limit) || 50)));
    var q = fs.query(
      fs.collection(set.db, "scores_rush"),
      fs.orderBy("t", "asc"),
      fs.limit(n)
    );
    var snap = await fs.getDocs(q);
    var out = [];
    snap.forEach(function (doc) {
      var v = doc.data();
      out.push({ n: v.n, t: v.t, h: v.h, d: v.d });
    });
    return out;
  }

  // ---- かちぬき：ぬいた人数の多い順（同数なら速い順） ----
  function cleanKachi(rec) {
    return {
      n: cleanName(rec),
      w: Math.floor(Number(rec.w) || 0),
      t: Math.floor(Number(rec.t) || 0),
      h: String(rec.h || "hero"),
      d: String(rec.d || "")
    };
  }

  async function submitKachi(rec) {
    var set = await ready();
    var fs = set.fs;
    var data = cleanKachi(rec);
    data.ts = fs.serverTimestamp();
    await fs.addDoc(fs.collection(set.db, "scores_kachi"), data);
  }

  async function topKachi(limit) {
    var set = await ready();
    var fs = set.fs;
    var n = Math.max(1, Math.min(500, Math.floor(Number(limit) || 50)));
    var q = fs.query(
      fs.collection(set.db, "scores_kachi"),
      fs.orderBy("w", "desc"),
      fs.orderBy("t", "asc"),
      fs.limit(n)
    );
    var snap = await fs.getDocs(q);
    var out = [];
    snap.forEach(function (doc) {
      var v = doc.data();
      out.push({ n: v.n, w: v.w, t: v.t, h: v.h, d: v.d });
    });
    return out;
  }

  window.HP_ONLINE = window.HP_ONLINE || {};
  window.HP_ONLINE.submitRush = submitRush;
  window.HP_ONLINE.topRush = topRush;
  window.HP_ONLINE.submitKachi = submitKachi;
  window.HP_ONLINE.topKachi = topKachi;
})();
