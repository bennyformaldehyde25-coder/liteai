/* ==========================================================================
   LiteAI Lab - videos.js
   Video data + rendering, tag filtering and search.

   HOW TO UPDATE THE VIDEOS
   1. Open this file and find the LITEAI_VIDEO_DATA block below.
   2. Replace the sample entries inside "videos": [ ... ] with your own JSON.
      Each entry supports: id, title, description, thumbnail, url, date,
      duration and tags (an array of strings).
   3. Save the file. Every tag you use appears automatically as a filter button.

   The data is embedded on purpose: no fetch() call is needed, so the site
   works when you open index.html straight from your computer (file://).
   ========================================================================== */

/* >>>>>>>>>>>>>>>>>>>>>>>>>>>> VIDEO DATA START <<<<<<<<<<<<<<<<<<<<<<<<<<<< */
const LITEAI_VIDEO_DATA = {
  "videos": [
    {
      "id": "sample-1",
      "title": "[Sample] Run a small language model on your own laptop",
      "description": "Placeholder entry. Replace this block with your real video data in assets/js/videos.js.\n\nThis sample shows how a full description is displayed, including line breaks.",
      "thumbnail": "assets/generated/thumb-1.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2025-03-12",
      "duration": "14:20",
      "tags": ["tutorial", "local-llm", "beginner"]
    },
    {
      "id": "sample-2",
      "title": "[Sample] Comparing three open-source chat interfaces",
      "description": "Placeholder entry. A side-by-side look at tools: setup time, features and rough edges.",
      "thumbnail": "assets/generated/thumb-2.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2025-02-20",
      "duration": "18:05",
      "tags": ["review", "tools", "open-source"]
    },
    {
      "id": "sample-3",
      "title": "[Sample] Experiment: how small can a useful model get?",
      "description": "Placeholder entry. An experiment write-up: what we tried, what worked and what did not.",
      "thumbnail": "assets/generated/thumb-3.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2025-02-02",
      "duration": "11:47",
      "tags": ["experiment", "local-llm", "performance"]
    },
    {
      "id": "sample-4",
      "title": "[Sample] Prompting basics for everyday tasks",
      "description": "Placeholder entry. Clear, reusable prompt patterns for writing, summarizing and planning.",
      "thumbnail": "assets/generated/thumb-4.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2025-01-15",
      "duration": "9:32",
      "tags": ["tutorial", "prompting", "beginner"]
    },
    {
      "id": "sample-5",
      "title": "[Sample] Automating a small workflow with scripts",
      "description": "Placeholder entry. Build a tiny automation step by step and learn where it can break.",
      "thumbnail": "assets/generated/thumb-5.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2024-12-28",
      "duration": "22:10",
      "tags": ["tutorial", "automation", "tools"]
    },
    {
      "id": "sample-6",
      "title": "[Sample] Tool review: an AI note-taking app",
      "description": "Placeholder entry. What it does well, where it falls short and who it suits.",
      "thumbnail": "assets/generated/thumb-6.png",
      "url": "https://www.youtube.com/@LiteAILab/videos",
      "date": "2024-12-05",
      "duration": "8:15",
      "tags": ["review", "tools", "productivity"]
    }
  ]
};
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>> VIDEO DATA END <<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

(function () {
  "use strict";

  var listEl = document.getElementById("video-list");
  if (!listEl) return; // not the home page

  var searchEl = document.getElementById("video-search");
  var chipsEl = document.getElementById("tag-filters");
  var countEl = document.getElementById("result-count");
  var clearEl = document.getElementById("clear-filters");
  var FALLBACK_THUMB = "assets/generated/thumb-1.png";

  var raw = Array.isArray(LITEAI_VIDEO_DATA) ? LITEAI_VIDEO_DATA : (LITEAI_VIDEO_DATA.videos || []);

  // Normalise and sort newest first.
  var videos = raw.map(function (v) {
    return {
      id: String(v.id || ""),
      title: String(v.title || "Untitled video"),
      description: String(v.description || ""),
      thumbnail: String(v.thumbnail || ""),
      url: String(v.url || (v.id ? "https://www.youtube.com/watch?v=" + v.id : "https://www.youtube.com/@LiteAILab")),
      date: String(v.date || ""),
      duration: String(v.duration || ""),
      tags: Array.isArray(v.tags) ? v.tags.map(String) : []
    };
  }).sort(function (a, b) { return b.date.localeCompare(a.date); });

  // Unique tags, alphabetical, case-insensitive.
  var tagSet = {};
  videos.forEach(function (v) {
    v.tags.forEach(function (t) { tagSet[t.toLowerCase()] = tagSet[t.toLowerCase()] || t; });
  });
  var allTags = Object.keys(tagSet).sort().map(function (k) { return tagSet[k]; });

  var state = { tag: "", query: "" };

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00Z");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function icon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function matches(v) {
    if (state.tag && !v.tags.some(function (t) { return t.toLowerCase() === state.tag.toLowerCase(); })) return false;
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    var hay = (v.description + " " + v.tags.join(" ") + " " + v.title).toLowerCase();
    return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
  }

  function card(v) {
    var thumb = el("img", {
      src: v.thumbnail || FALLBACK_THUMB,
      alt: "Thumbnail for " + v.title,
      width: "640", height: "360",
      loading: "lazy", decoding: "async"
    });
    thumb.addEventListener("error", function onErr() {
      thumb.removeEventListener("error", onErr);
      thumb.src = FALLBACK_THUMB;
    });

    var thumbLink = el("a", { "class": "video-thumb", href: v.url, target: "_blank", rel: "noopener noreferrer", "aria-label": "Watch " + v.title + " on YouTube (opens in a new tab)" }, [thumb]);
    if (v.duration) thumbLink.appendChild(el("span", { "class": "duration-badge", "aria-hidden": "true", text: v.duration }));

    var meta = el("ul", { "class": "video-meta" });
    if (v.date) {
      var time = el("time", { datetime: v.date, text: formatDate(v.date) });
      meta.appendChild(el("li", null, [icon("i-calendar"), time]));
    }
    if (v.duration) meta.appendChild(el("li", null, [icon("i-clock"), el("span", { text: v.duration })]));

    var tags = el("div", { "class": "video-tags", role: "group", "aria-label": "Tags" });
    v.tags.forEach(function (t) {
      tags.appendChild(el("button", { type: "button", "class": "tag-badge", "data-tag": t, "aria-label": "Filter by tag " + t, text: "#" + t }));
    });

    var btn = el("a", { "class": "btn btn-primary", href: v.url, target: "_blank", rel: "noopener noreferrer" }, [
      icon("i-play"), el("span", { text: "Watch on YouTube" })
    ]);

    var info = el("div", { "class": "video-info" }, [
      el("h3", { text: v.title }),
      meta,
      el("p", { "class": "video-desc", text: v.description }),
      v.tags.length ? tags : null,
      btn
    ]);

    var art = el("article", { "class": "video-card reveal" }, [thumbLink, info]);
    return el("li", null, [art]);
  }

  function renderChips() {
    chipsEl.textContent = "";
    var items = [""].concat(allTags);
    items.forEach(function (t) {
      var pressed = state.tag.toLowerCase() === t.toLowerCase();
      var b = el("button", { type: "button", "class": "chip", "data-tag": t, "aria-pressed": pressed ? "true" : "false", text: t ? "#" + t : "All" });
      chipsEl.appendChild(b);
    });
  }

  var observer = null;
  function observe(nodes) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); observer.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
    }
    nodes.forEach(function (n) { observer.observe(n); });
  }

  function render() {
    var shown = videos.filter(matches);
    listEl.textContent = "";
    if (!shown.length) {
      listEl.appendChild(el("li", null, [
        el("div", { "class": "empty-state" }, [
          el("h3", { text: "No videos match" }),
          el("p", { text: "Try a different word, or clear the tag filter to see every video." })
        ])
      ]));
    } else {
      shown.forEach(function (v) { listEl.appendChild(card(v)); });
      observe([].slice.call(listEl.querySelectorAll(".reveal")));
    }
    var total = videos.length;
    countEl.textContent = (shown.length === total)
      ? "Showing all " + total + (total === 1 ? " video" : " videos")
      : "Showing " + shown.length + " of " + total + " videos";
    var filtered = !!(state.tag || state.query.trim());
    clearEl.hidden = !filtered;
    [].forEach.call(chipsEl.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-tag").toLowerCase() === state.tag.toLowerCase() ? "true" : "false");
    });
  }

  function setTag(tag) {
    state.tag = tag;
    render();
  }

  // Events
  chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    var t = b.getAttribute("data-tag");
    setTag(state.tag.toLowerCase() === t.toLowerCase() ? "" : t);
  });

  listEl.addEventListener("click", function (e) {
    var b = e.target.closest(".tag-badge");
    if (!b) return;
    setTag(b.getAttribute("data-tag"));
    var bar = document.getElementById("video-toolbar");
    if (bar) bar.scrollIntoView({ block: "start" });
    var active = chipsEl.querySelector('.chip[aria-pressed="true"]');
    if (active) active.focus({ preventScroll: true });
  });

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });

  clearEl.addEventListener("click", function () {
    state.tag = "";
    state.query = "";
    searchEl.value = "";
    render();
    searchEl.focus();
  });

  // Links elsewhere on the page (e.g. Highlights) can pre-select a tag:
  // <a href="#videos" data-filter-tag="tutorial">
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-filter-tag]");
    if (!a) return;
    var wanted = a.getAttribute("data-filter-tag").toLowerCase();
    var found = allTags.filter(function (t) { return t.toLowerCase() === wanted; })[0];
    state.query = "";
    searchEl.value = "";
    setTag(found || "");
  });

  renderChips();
  render();
})();
