/* app.js — TDStudio main script */
"use strict";

/* =========================
   1) i18n (lang.json)
   ========================= */
const byId = [
  "gamedexuat", "xemtatca", "tintuc", "exit",
  "heading", "updated",
  "summary_title", "summary_text",
  "scope_title", "scope_text",
  "data_title", "data_user", "data_game", "data_diagnostics",
  "rights_title", "rights_text",
  "contact_title", "contact_text",
  "changes_title", "changes_text",
  "short_title", "short_text",
  "footer_note"
];
const HTML_KEYS = new Set([
  "summary_text", "scope_text",
  "data_user", "data_game", "data_diagnostics",
  "rights_text", "contact_text",
  "changes_text",
  "short_text"
]);

async function initLang() {
  try {
    const res = await fetch("lang.json");
    const data = await res.json();

    const deviceLang = (navigator.language || navigator.userLanguage || "en")
      .toLowerCase().split("-")[0];
    const lang = data[deviceLang] ? deviceLang : "en";
    const dict = data[lang];
    document.documentElement.lang = lang;

    byId.forEach((key) => {
      const el = document.getElementById(key) || document.querySelector(`[data-i18n="${key}"]`);
      if (!el || dict[key] == null) return;
      if (HTML_KEYS.has(key)) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });

    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  } catch (err) {
    console.error("Không tải được lang.json", err);
  }
}

/* =========================
   2) Utils
   ========================= */
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1400);
}

/* =========================
   3) Tabbar active
   ========================= */
function initTabbar() {
  const tabs = $$(".tabbar__item");
  tabs.forEach((t) => {
    t.addEventListener("click", (e) => {
      tabs.forEach((x) => x.classList.remove("is-active"));
      e.currentTarget.classList.add("is-active");
    });
  });
}

/* =========================
   4) Giftcode Modal
   ========================= */
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

function openGiftModal() {
  const modal = $("#giftcodeModal");
  if (!modal) return;

  // render list nếu chưa render
  const list = $("#giftList");
  if (list && !list.dataset.rendered) {
    list.innerHTML = giftcodes.map((g) => `
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

  // bind copy buttons
  $$(".gift-copy", modal).forEach((btn) => {
    btn.onclick = async (e) => {
      const code = e.currentTarget.dataset.code;
      try {
        await navigator.clipboard.writeText(code);
        showToast("Đã copy: " + code);
      } catch {
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

function initGiftcode() {
  $("#btnGiftcode")?.addEventListener("click", (e) => {
    e.preventDefault();
    openGiftModal();
  });
  document.body.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.close === "giftcode") closeGiftModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGiftModal();
  });

  $("#copyAllGift")?.addEventListener("click", async () => {
    const all = giftcodes.map((g) => g.code).join(" ");
    try {
      await navigator.clipboard.writeText(all);
      showToast("Đã copy tất cả mã");
    } catch {
      showToast("Không copy được!");
    }
  });
}

/* =========================
   5) Posts render (mock)
   ========================= */
const POSTS_PAGE_SIZE = 5;
const allPosts = [
  {
    title: "Sự Kiện KOL - Nhận Dialga",
    href: "https://www.facebook.com/share/p/17bfrTt46h/",
    img: "assets/event1.jpg",
    cat: "Event",
    date: "14/10/2025",
    excerpt: "Cùng like và bình luận dưới bài viết để nhận ngay thưởng Dialga!",
  },
  {
    title: "Sự kiện Trung Thu 2025",
    href: "https://www.facebook.com/share/p/1Eav67sPTJ/",
    img: "assets/event3.jpg",
    cat: "Event",
    date: "14/10/2025",
    excerpt: "Cùng like và bình luận dưới bài viết để nhận ngay Giftcode Trung Thu cực chất!",
  },
  {
    title: " Nhập Vai KOL - Thực Thụ",
    href: "https://www.facebook.com/share/p/1CbjcpphGz/",
    img: "assets/event2.jpg",
    cat: "Update",
    date: "14/10/2025",
    excerpt: "We’re excited to announce that our Contact & Support page has just been updated!",
  },
  {
    title: "Meme - Thách thực dịch chữ",
    href: "https://www.facebook.com/share/p/19RyxG65jn/",
    img: "assets/event4.jpg",
    cat: "Update",
    date: "14/10/2025",
    excerpt: "We’re excited to announce that our Contact & Support page has just been updated!",
  },
  {
    title: "Meme - Chủ quan không kiểm tra",
    href: "https://www.facebook.com/share/p/1BKwnKiCjG/",
    img: "assets/event5.jpg",
    cat: "Update",
    date: "14/10/2025",
    excerpt: "We’re excited to announce that our Contact & Support page has just been updated!",
  }
];
let postsRendered = 0;

function renderMorePosts() {
  const wrap = $("#posts");
  if (!wrap) return;

  const next = allPosts.slice(postsRendered, postsRendered + POSTS_PAGE_SIZE);
  next.forEach((p) => {
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

  const btn = $("#loadMorePosts");
  if (btn) {
    if (postsRendered >= allPosts.length) {
      btn.disabled = true;
      btn.textContent = "Hết bài";
      btn.style.opacity = ".6";
    } else {
      btn.disabled = false;
      btn.textContent = "Tải thêm";
      btn.style.opacity = "1";
    }
  }
}

function initPosts() {
  renderMorePosts();
  $("#loadMorePosts")?.addEventListener("click", renderMorePosts);
  // hỗ trợ cả id cũ nếu bạn dùng: seeAllPosts hoặc xemtatca
  $("#seeAllPosts")?.addEventListener("click", (e) => {
    e.preventDefault();
    while (postsRendered < allPosts.length) renderMorePosts();
  });
  $("#xemtatca")?.addEventListener("click", (e) => {
    e.preventDefault();
    while (postsRendered < allPosts.length) renderMorePosts();
  });
}

/* =========================
   6) Register & Community modals
   ========================= */
const NDX_SERVERS = [
  { id:"clan", title:"Server 1 (Clan)", sub:"GAME HOT", url:"https://nroclan.com/register",  thumb:"assets/1.png" },
  { id:"3q",   title:"Server 2 (3Q)",   sub:"GAME HOT", url:"https://nro3q.com/register",    thumb:"assets/2.png" },
  { id:"mun",  title:"Server 3 (Mun)",  sub:"GAME HOT", url:"https://nromun.com/register",   thumb:"assets/3.png" },
  { id:"ping", title:"Server 4 (Ping)", sub:"GAME HOT", url:"https://nroping.com/register", thumb:"assets/4.png" },
  { id:"kid",  title:"Server 5 (Kid)",  sub:"GAME HOT", url:"https://nrokid.com/register",   thumb:"assets/5.png" },
];
const NDX_COMMUNITIES = {
  zalo: [
    { name:"Server 1 (Clan - Box 1)", url:"https://zalo.me/g/guxxky409" },
    { name:"Server 1 (Clan - Box 2)", url:"https://zalo.me/g/chhtoc951" },
    { name:"Server 2 (3Q - Box 1)", url:"https://zalo.me/g/pqaiqm424" },
    { name:"Server 3 (Mun - Box 1)", url:"https://zalo.me/g/crnbag894" },
    { name:"Server 4 (Ping - Box 1)", url:"https://zalo.me/g/gfnekq114" },
    { name:"Server 5 (Kid - Box 1)", url:"https://zalo.me/g/uelhmv606" },
    { name:"Server 5 (Kid - Box 2)", url:"https://zalo.me/g/vmtbba265" },
    { name:"Cộng đồng ngọc rồng chung", url:"https://zalo.me/g/jcssww622" },
  ],
  telegram: [
    { name:"Telegram – Cộng đồng", url:"https://t.me/gdthanhdi" },
  ],
  facebook: [
    { name:"Fanpage TDStudio - Quan trọng", url:"https://www.facebook.com/ngocrongnthevmax" },
    { name:"Fanpage TDStudio - Event game", url:"https://www.facebook.com/ngaidinro" },
    { name:"Group cộng đồng Facebook",  url:"https://www.facebook.com/groups/916049213653568" },
  ],
  discord: [
    { name:"Discord – Cộng đồng", url:"https://discord.gg/jW8uBff4" },
  ],
};
const NDX_ORDER = ["zalo", "telegram", "facebook", "discord"];

function initModals() {
  const $btnReg    = $("#ndx-btn-register");
  const $btnComm   = $("#ndx-btn-comm");
  const $modalReg  = $("#ndx-modal-register");
  const $modalComm = $("#ndx-modal-comm");
  const $list      = $("#ndx-server-list");
  const $submit    = $("#ndx-submit");
  const $tabs      = $("#ndx-comm-tabs");
  const $links     = $("#ndx-comm-links");

  function ndxOpen(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function ndxClose(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  function ndxWireClose(modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.matches("[data-ndx-close]")) ndxClose(modal);
    });
  }
  ndxWireClose($modalReg);
  ndxWireClose($modalComm);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if ($modalReg.classList.contains("is-open")) ndxClose($modalReg);
      if ($modalComm.classList.contains("is-open")) ndxClose($modalComm);
    }
  });

  // Register
  let ndxSelectedServerId = null;
  function ndxRenderServers() {
    $list.innerHTML = NDX_SERVERS.map((s, i) => `
      <label class="ndx-server-item" for="ndx-sv-${s.id}">
        <input type="radio" name="ndx-server" id="ndx-sv-${s.id}" value="${s.id}" ${i===0 ? "checked" : ""}>
        <div class="ndx-server-thumb"><img src="${s.thumb}" alt="${s.title}"></div>
        <div class="ndx-server-meta">
          <span class="ndx-server-title">${s.title}</span>
          <span class="ndx-server-sub">${s.sub}</span>
        </div>
      </label>
    `).join("");
    ndxSelectedServerId = NDX_SERVERS[0]?.id || null;
    $submit.disabled = !ndxSelectedServerId;
    $list.querySelectorAll('input[name="ndx-server"]').forEach((r) => {
      r.addEventListener("change", (e) => {
        ndxSelectedServerId = e.target.value;
        $submit.disabled = !ndxSelectedServerId;
      });
    });
  }
  $btnReg?.addEventListener("click", () => {
    ndxRenderServers();
    ndxOpen($modalReg);
    setTimeout(() => $submit?.focus(), 0);
  });
  $submit?.addEventListener("click", () => {
    const found = NDX_SERVERS.find((s) => s.id === ndxSelectedServerId);
    if (!found || !found.url) { alert("Thiếu URL đăng ký cho server này."); return; }
    window.location.href = found.url;
  });

  // Community
  function ndxRenderTabs(active) {
    $tabs.innerHTML = NDX_ORDER.map((t) => `
      <button class="ndx-comm-tab ${t===active ? "is-active" : ""}" data-type="${t}">
        ${t.charAt(0).toUpperCase() + t.slice(1)}
      </button>
    `).join("");
    [...$tabs.children].forEach((btn) => {
      btn.addEventListener("click", () => {
        $tabs.querySelectorAll(".ndx-comm-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        ndxRenderLinks(btn.dataset.type);
      });
    });
  }
  function ndxRenderLinks(type) {
    const items = NDX_COMMUNITIES[type] || [];
    $links.innerHTML = items.length
      ? items.map((i) => `<a class="ndx-comm-link" target="_blank" rel="noopener" href="${i.url}">🔗 <span>${i.name}</span></a>`).join("")
      : `<div style="opacity:.75">Chưa có link cho loại <b>${type}</b>.</div>`;
  }
  $btnComm?.addEventListener("click", () => {
    const first = NDX_ORDER[0];
    ndxRenderTabs(first);
    ndxRenderLinks(first);
    ndxOpen($modalComm);
  });
}

/* =========================
   7) Messenger FAB (badge + wiggle + click)
   ========================= */
(function messengerFabInit() {
  const PAGE_USERNAME = "ngocrongnthevmax";
  const MME_URL      = `https://m.me/${encodeURIComponent(PAGE_USERNAME)}`;
  const FANPAGE_URL  = `https://facebook.com/${encodeURIComponent(PAGE_USERNAME)}`;
  const isMobileUA   = () => /Android|iPhone|iPad|iPod|IEMobile|Windows Phone|Mobile/i.test(navigator.userAgent || "");

  function handleClick(e) {
    e.preventDefault();
    clearUnread(); // tắt badge khi user nhấn
    if (isMobileUA()) location.href = MME_URL;
    else window.open(FANPAGE_URL, "_blank", "noopener,noreferrer");
  }

  function bind() {
    const el = $("#ndxMsgrFab");
    if (!el) return;
    el.addEventListener("click", handleClick, { passive: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();

/* Public API để dùng ở nơi khác nếu cần */
function setUnread(count = 1) {
  const el = $("#ndxMsgrFab");
  if (!el) return;
  el.classList.add("is-unread");
  el.setAttribute("data-badge", String(count));
}
function clearUnread() {
  const el = $("#ndxMsgrFab");
  if (!el) return;
  el.classList.remove("is-unread");
  el.removeAttribute("data-badge");
}
window.setUnread = setUnread;
window.clearUnread = clearUnread;

/* =========================
   8) Bootstrap — chỉ 1 lần DOM ready
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  initLang();        // i18n
  initTabbar();      // tabbar active
  initGiftcode();    // giftcode modal
  initPosts();       // news/posts render
  initModals();      // register + community modals

  // Demo: tự bật badge để thấy lắc (bạn có thể xoá dòng này)
  setUnread(1);
}, { once: true });
/* ===== Gallery 1..20 (skip missing, try multiple folders) ===== */
const NDX_GAL_CFG = {
  baseDirs: ['assets/gallery/', 'assets/'],  // thứ tự ưu tiên
  from: 1,
  to: 20,
  exts: ['webp','jpg','png'],
  cacheBust: false
};

function probeImage(url){
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve({ ok:true, url });
    img.onerror = () => resolve({ ok:false, url });
    img.decoding = 'async';
    img.loading  = 'lazy';
    img.src = url;
  });
}

async function findExistingForIndex(idx, cfg = NDX_GAL_CFG){
  for (const base of cfg.baseDirs){
    for (const ext of cfg.exts){
      const u = base + idx + '.' + ext + (cfg.cacheBust ? ('?v=' + Date.now()) : '');
      const r = await probeImage(u);
      if (r.ok) return r.url;
    }
  }
  return null;
}

async function loadNumberedGallery(cfg = NDX_GAL_CFG){
  const tasks = [];
  for (let i = cfg.from; i <= cfg.to; i++){
    tasks.push(findExistingForIndex(i, cfg));
  }
  const results = await Promise.all(tasks);
  const list = results.filter(Boolean);
  console.log('[Gallery] found', list.length, 'images:', list);
  return list;
}

function renderNumberedGallery(images){
  const rail = document.getElementById('ndxGalRail');
  if (!rail) return;
  if (!images.length){
    rail.innerHTML = `<div style="opacity:.7;padding:10px">Không tìm thấy ảnh 1→${NDX_GAL_CFG.to}.</div>`;
    return;
  }
  rail.innerHTML = images.map((src, i) => `
    <figure class="ndx-gal-item">
      <img src="${src}" alt="Ảnh ${i+1}" decoding="async" loading="lazy">
      <figcaption class="ndx-gal-cap">${i+1}/${images.length}</figcaption>
    </figure>
  `).join('');
}

function bindGalleryNav(){
  const vp = document.getElementById('ndxGalViewport');
  if (!vp) return;
  const itemWidth = () => {
    const first = vp.querySelector('.ndx-gal-item');
    const gap = 10;
    return first ? first.getBoundingClientRect().width + gap : vp.clientWidth * 0.8;
    };
  document.querySelectorAll('.ndx-gal-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir || 1);
      vp.scrollBy({ left: dir * itemWidth(), behavior: 'smooth' });
    });
  });
}

async function initNumberedGallery(){
  const imgs = await loadNumberedGallery();
  renderNumberedGallery(imgs);
  bindGalleryNav();
}
document.addEventListener('DOMContentLoaded', initNumberedGallery);

(function(){
  const fab = document.getElementById('ndxMsgrFab');
  const hint = document.getElementById('msgrHint');
  const closeBtn = hint.querySelector('.ndx-hint-close');
  const KEY = 'ndx_msgr_hint_closed';

  function showHint(){
    if (sessionStorage.getItem(KEY) === '1') return;
    hint.classList.add('show');
    hint.setAttribute('aria-hidden', 'false');
  }
  function hideHint(){
    hint.classList.remove('show');
    hint.setAttribute('aria-hidden', 'true');
    // sessionStorage.setItem(KEY, '1');
  }

  // Tự bật sau 3 giây
  window.addEventListener('load', () => setTimeout(showHint, 3000));

  // Ẩn khi người dùng bấm nút đóng hoặc bấm nút chat
  closeBtn.addEventListener('click', hideHint);
  fab.addEventListener('click', hideHint);
})();
