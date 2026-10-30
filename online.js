// ============================================================
// みったーパズル オンラインランキング用 online.js
// Firebase (Firestore) につないで、みんなのランキングを共有します。
//
// ★使い方★
// 下の firebaseConfig の 4つの中身を、自分の Firebase の値に
// 書きかえてください（手順書の「手順3」に やり方があります）。
// 書きかえるのは このファイルの この場所だけです。
// index.html など ゲーム本体のファイルは さわりません。
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBq_sGnzIjjqI5Ng0HH6jfuXEaq6ATMxMU",
  authDomain: "mitter-puzzle.firebaseapp.com",
  projectId: "mitter-puzzle",
  appId: "1:29089502139:web:0f6b8225d1ce7c272fea9e"
};

// ---- ここから下は 書きかえなくて OK です ----
(function () {
  "use strict";

  var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
  var readyPromise = null;

  // Firebase の読みこみは 最初の submit / top のときだけ（遅延読みこみ）
  function ready() {
    if (!readyPromise) {
      readyPromise = Promise.all([
        import(SDK + "firebase-app.js"),
        import(SDK + "firebase-firestore.js")
      ]).then(function (mods) {
        var app = mods[0].initializeApp(firebaseConfig);
        return { fs: mods[1], db: mods[1].getFirestore(app) };
      });
    }
    return readyPromise;
  }

  // 送る前に 形を整える（サーバー側のルールでも 同じチェックをしています）
  function clean(rec) {
    return {
      n: String(rec.n == null ? "" : rec.n).slice(0, 10),
      s: Math.floor(Number(rec.s) || 0),
      c: Math.floor(Number(rec.c) || 0),
      k: Math.floor(Number(rec.k) || 0),
      t: Math.floor(Number(rec.t) || 0),
      h: String(rec.h || "hero"),
      d: String(rec.d || "")
    };
  }

  // 記録を1件 保存する。失敗したら エラーを投げる（ゲーム側が エラー表示を出す）
  async function submit(rec) {
    var set = await ready();
    var fs = set.fs;
    var data = clean(rec);
    data.ts = fs.serverTimestamp(); // 送った時刻（管理用。ランキングには出しません）
    await fs.addDoc(fs.collection(set.db, "scores"), data);
  }

  // スコアの高い順に limit件 返す
  async function top(limit) {
    var set = await ready();
    var fs = set.fs;
    var n = Math.max(1, Math.min(200, Math.floor(Number(limit) || 50)));
    var q = fs.query(
      fs.collection(set.db, "scores"),
      fs.orderBy("s", "desc"),
      fs.limit(n)
    );
    var snap = await fs.getDocs(q);
    var out = [];
    snap.forEach(function (doc) {
      var v = doc.data();
      out.push({ n: v.n, s: v.s, c: v.c, k: v.k, t: v.t, h: v.h, d: v.d });
    });
    return out;
  }

  window.HP_ONLINE = { submit: submit, top: top };
})();
