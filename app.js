
async function initLang() {
  try {
    const res = await fetch('lang.json');
    const data = await res.json();

    // Lấy lang từ thiết bị
    const deviceLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];
    const lang = data[deviceLang] ? deviceLang : 'en';
    document.documentElement.lang = lang;

    const dict = data[lang];

    // Gắn theo data-i18n (ưu tiên vì có nhiều key và có HTML)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = dict[key];
      if (val == null) return;
      // Một số key có HTML (b, br, a, …) nên dùng innerHTML
      el.innerHTML = val;
    });

    // Nếu vẫn muốn gắn theo ID cho vài chỗ đặc biệt (tùy trang có)
    const byId = ['gamedexuat', 'xemtatca', 'exit', 'heading', 'updated'];
    byId.forEach(id => {
      const el = document.getElementById(id);
      if (el && dict[id] != null) {
        // Với các ID này đa phần là text đơn giản
        el.textContent = dict[id];
      }
    });

    // Footer year
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  } catch (err) {
    console.error('Không tải được lang.json', err);
  }
}

// Gọi sau khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initLang);


// Chạy khi load xong trang
initLang();

// Chỉ giữ logic nhỏ cho tabbar (không có sidebar)
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tabbar__item');
  tabs.forEach(t => t.addEventListener('click', (e) => {
    tabs.forEach(x => x.classList.remove('is-active'));
    e.currentTarget.classList.add('is-active');
  }));
});
// ===== Giftcode Popup =====
const giftcodes = [
  { code: "open1", note: "999 Set kích hoạt", exp: "Vô thời hạn" },
  { code: "open2", note: "999 Bộ Ngọc Rồng 3 Sao", exp: "Vô thời hạn" },
  { code: "open3", note: "20 Cuồng nộ thường + Siêu cấp", exp: "Vô thời hạn" },
  { code: "open4", note: "20 Bổ huyết thường + Siêu cấp", exp: "Vô thời hạn" },
  { code: "open5", note: "20 Bổ khí thường + Siêu cấp", exp: "Vô thời hạn" },
  { code: "open6", note: "20 Giáp xên + Siêu cấp", exp: "Vô thời hạn" },
  { code: "open7", note: "Pet đi theo vĩnh viễn", exp: "Vô thời hạn" },
  { code: "open8", note: "Thú cưỡi vĩnh viễn", exp: "Vô thời hạn" },
  { code: "open9", note: "Cánh điện đeo lưng vĩnh viễn", exp: "Vô thời hạn" },
  { code: "open10", note: "Chân mệnh vĩnh viễn", exp: "Vô thời hạn" },
  { code: "open11", note: "5000 Thỏi vàng", exp: "Vô thời hạn" },
  { code: "open12", note: "5000 Thỏi vàng", exp: "Vô thời hạn" },
  { code: "open13", note: "5000 Thỏi vàng", exp: "Vô thời hạn" },
  { code: "open14", note: "5000 Thỏi vàng", exp: "Vô thời hạn" },
  { code: "open15", note: "Linh thú vĩnh viễn", exp: "Vô thời hạn" }
];

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1400);
}

function openGiftModal() {
  const modal = $("#giftcodeModal");
  if (!modal) return;

  // render list nếu chưa render
  const list = $("#giftList");
  if (list && !list.dataset.rendered) {
    list.innerHTML = giftcodes.map((g, i) => `
  <li class="gift-item">
    <span class="gift-code">${g.code}</span>
    <div class="gift-info">
      <span class="gift-note">${g.note}</span>
      ${g.exp && g.exp !== "—" ? `<span class="gift-exp">HSD: ${g.exp}</span>` : ""}
    </div>
    <button class="gift-copy" data-code="${g.code}">Copy</button>
  </li>
`).join("");

    list.dataset.rendered = "1";
  }

  // bind copy buttons (idempotent)
  $$(".gift-copy", modal).forEach(btn => {
    btn.onclick = async (e) => {
      const code = e.currentTarget.dataset.code;
      try {
        await navigator.clipboard.writeText(code);
        showToast("Đã copy: " + code);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = code; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy"); ta.remove();
        showToast("Đã copy: " + code);
      }
    };
  });

  modal.classList.add("show");
  document.body.classList.add("modal-open");
  $("#btnGiftcode")?.blur();
}

function closeGiftModal() {
  $("#giftcodeModal")?.classList.remove("show");
  document.body.classList.remove("modal-open");
}

// triggers
document.addEventListener("DOMContentLoaded", () => {
  $("#btnGiftcode")?.addEventListener("click", (e) => { e.preventDefault(); openGiftModal(); });
  // close by buttons or backdrop
  document.body.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.close === "giftcode") { closeGiftModal(); }
  });
  // esc to close
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeGiftModal(); });
});

// Copy tất cả
$("#copyAllGift")?.addEventListener("click", async () => {
  const all = giftcodes.map(g => g.code).join(" ");
  try {
    await navigator.clipboard.writeText(all);
    showToast("Đã copy tất cả mã");
  } catch {
    showToast("Không copy được!");
  }
});
// ===== Posts (mock data + render) =====
const POSTS_PAGE_SIZE = 3;
const allPosts = [
  {
    title: "Điểm danh sự kiện Trung Thu 2025",
    href: "https://www.facebook.com/share/p/16Hu2QRbkS/",
    img: "assets/event3.png",
    cat: "Event",
    date: "16/09/2025",
    excerpt: "Cùng like và bình luận dưới bài viết để nhận ngay Giftcode Trung Thu cực chất!",
  },
  {
    title: "Quà tặng điểm danh - PocketBall",
    href: "https://www.facebook.com/share/p/1DAwViXjBy/",
    img: "assets/event2.png",
    cat: "Event",
    date: "15/09/2025",
    excerpt: "Cùng like và bình luận dưới bài viết để nhận ngay Giftcode PoketBall Pokemon!",
  },
  {
    title: " New Update: Contact & Support Page",
    href: "https://www.facebook.com/share/p/1BRRWAEfev/",
    img: "assets/event1.png",
    cat: "Update",
    date: "14/09/2025",
    excerpt: "We’re excited to announce that our Contact & Support page has just been updated!",
  },
];

let postsRendered = 0;

function renderMorePosts() {
  const wrap = document.getElementById("posts");
  if (!wrap) return;

  const next = allPosts.slice(postsRendered, postsRendered + POSTS_PAGE_SIZE);
  next.forEach(p => {
    const el = document.createElement("a");
    el.className = "post-card";
    el.href = p.href; el.target = "_blank"; el.rel = "noopener";
    el.innerHTML = `
      <img class="post-thumb" src="${p.img}" alt="${p.title}">
      <div class="post-body">
        <div class="post-meta">
          <span class="badge">${p.cat}</span>
          <span>${p.date}</span>
        </div>
        <h3 class="post-title">${p.title}</h3>
        <p class="post-excerpt">${p.excerpt}</p>
      </div>
    `;
    wrap.appendChild(el);
  });

  postsRendered += next.length;

  const btn = document.getElementById("loadMorePosts");
  if (btn) {
    if (postsRendered >= allPosts.length) {
      btn.disabled = true;
      btn.textContent = "Hết bài";
      btn.style.opacity = .6;
    } else {
      btn.disabled = false;
      btn.textContent = "Tải thêm";
      btn.style.opacity = 1;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // render trang đầu
  renderMorePosts();

  document.getElementById("loadMorePosts")?.addEventListener("click", () => {
    renderMorePosts();
  });

  document.getElementById("seeAllPosts")?.addEventListener("click", (e) => {
    e.preventDefault();
    // Tùy bạn: mở trang tin tức riêng, hoặc tải hết tại đây
    while (postsRendered < allPosts.length) renderMorePosts();
  });
});
