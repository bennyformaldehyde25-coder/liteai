/* ==========================================================================
   LiteAI Lab - main.js
   Site-wide behaviour: theme toggle, mobile menu, hero boot sequence,
   scroll reveal, footer year and the static contact form.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle (dark by default) ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  function currentTheme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function syncThemeButton() {
    if (!themeBtn) return;
    var light = currentTheme() === "light";
    themeBtn.setAttribute("aria-pressed", light ? "true" : "false");
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("liteai-theme", next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- scroll reveal for static blocks ---------- */
  var statics = [].slice.call(document.querySelectorAll(".reveal"));
  if (statics.length) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      statics.forEach(function (n) { n.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      statics.forEach(function (n) { io.observe(n); });
    }
  }

  /* ---------- hero boot sequence (plays once) ---------- */
  var boot = document.getElementById("boot-text");
  if (boot) {
    var lines = [
      { t: "> booting liteai-lab", ok: false },
      { t: "> loading tutorials ....... ", ok: true },
      { t: "> loading experiments ..... ", ok: true },
      { t: "> loading tools + reviews . ", ok: true },
      { t: "> ready", ok: false }
    ];
    var cursor = '<span class="cursor" aria-hidden="true"></span>';
    var render = function (done, partial) {
      var html = "";
      for (var i = 0; i < done; i++) {
        html += lines[i].t + (lines[i].ok ? '<span class="ok">ok</span>' : "") + "\n";
      }
      if (partial !== null && done < lines.length) html += partial;
      boot.innerHTML = html + cursor;
    };
    if (reduceMotion) {
      render(lines.length, null);
    } else {
      var li = 0, ci = 0;
      var tick = function () {
        if (li >= lines.length) { render(lines.length, null); return; }
        var line = lines[li];
        if (ci <= line.t.length) {
          render(li, line.t.slice(0, ci));
          ci += 2;
          setTimeout(tick, 22);
        } else {
          li++; ci = 0;
          render(li, "");
          setTimeout(tick, line.ok ? 160 : 260);
        }
      };
      render(0, "");
      setTimeout(tick, 350);
    }
  }

  /* ---------- contact form (static: Formspree or mailto) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var endpoint = (form.getAttribute("data-formspree") || "").trim();
    var mailTo = (form.getAttribute("data-mailto") || "").trim();

    var setStatus = function (msg, isError) {
      status.textContent = msg;
      status.style.color = isError ? "var(--focus)" : "var(--success)";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var message = form.elements["message"].value.trim();

      if (endpoint) {
        // Formspree mode: posts the form and stays on the page.
        setStatus("Sending...", false);
        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        }).then(function (res) {
          if (res.ok) { form.reset(); setStatus("Message sent. Thanks for reaching out.", false); }
          else { setStatus("The message could not be sent. Please try again or use email.", true); }
        }).catch(function () {
          setStatus("The message could not be sent. Check your connection and try again.", true);
        });
        return;
      }

      // mailto fallback: opens the visitor's email app with the message filled in.
      var subject = "Message from " + name + " via LiteAI Lab";
      var body = message + "\n\n-- \n" + name + " <" + email + ">";
      window.location.href = "mailto:" + mailTo + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      setStatus("Your email app should open with the message ready to send.", false);
    });
  }
})();
