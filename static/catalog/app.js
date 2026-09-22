(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  function haptic(kind) {
    var h = tg && tg.HapticFeedback;
    if (!h) return;
    try {
      if (kind === "select" && h.selectionChanged) h.selectionChanged();
      else if (kind === "success" && h.notificationOccurred) h.notificationOccurred("success");
      else if (kind === "error" && h.notificationOccurred) h.notificationOccurred("error");
      else if (kind === "warning" && h.notificationOccurred) h.notificationOccurred("warning");
      else if (h.impactOccurred) h.impactOccurred(kind || "light");
    } catch (err) {}
  }
  if (tg && tg.ready) tg.ready();
  const user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
  const payload = user && user.id
    ? {
        id: user.id,
        first_name: user.first_name || "Житель",
        last_name: user.last_name || "",
        username: user.username || "",
        photo_url: user.photo_url || "",
      }
    : { id: 1, first_name: "Даниил", username: "open_url", photo_url: "/static/catalog/photos/avatar.gif" };
  const flags = location.protocol === "https:"
    ? ";path=/;max-age=31536000;secure;samesite=none"
    : ";path=/;max-age=31536000;samesite=lax";
  document.cookie = "tg_user=" + encodeURIComponent(JSON.stringify(payload)) + flags;
  if (tg && tg.initData) {
    document.cookie = "tg_init=" + encodeURIComponent(tg.initData) + flags;
  }
  var startParam = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
  if (startParam) {
    var applied = sessionStorage.getItem("tg_start");
    if (applied !== String(startParam)) {
      sessionStorage.setItem("tg_start", String(startParam));
      var go = "";
      var sm = String(startParam).match(/^s(\d+)$/);
      var cm = String(startParam).match(/^c(\d+)$/);
      var mm = String(startParam).match(/^m(\d+)$/);
      if (sm) go = "/services/" + sm[1] + "/";
      if (cm) go = "/companies/" + cm[1] + "/";
      if (mm) go = "/market/" + mm[1] + "/";
      if (go && location.pathname !== go) {
        location.replace(go);
        return;
      }
    }
  }
  function injectInit(form) {
    if (!form || !tg || !tg.initData) return;
    var existing = form.querySelector("input[name=_tg_init]");
    if (existing) {
      existing.value = tg.initData;
      return;
    }
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "_tg_init";
    input.value = tg.initData;
    form.appendChild(input);
  }
  document.querySelectorAll("form").forEach(injectInit);
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.tagName === "FORM") injectInit(e.target);
  }, true);
  if (user && user.id && String(user.id) !== document.documentElement.dataset.uid) {
    var n = Number(sessionStorage.getItem("tg_reload") || 0);
    if (n < 2) {
      sessionStorage.setItem("tg_reload", String(n + 1));
      setTimeout(function () { location.reload(); }, n ? 400 : 50);
      return;
    }
  } else {
    sessionStorage.removeItem("tg_reload");
  }
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
    const dark = document.documentElement.classList.contains("dark");
    if (tg.setHeaderColor) tg.setHeaderColor(dark ? "#1c1c1e" : "#ffffff");
    if (tg.setBackgroundColor) tg.setBackgroundColor(dark ? "#000000" : "#ffffff");
    var lockedH = 0;
    var safeLocked = false;
    const apply = function (ev) {
      if (ev && ev.isStateStable === false) return;
      if (tg.isExpanded === false) tg.expand();
      var next = Math.round(tg.viewportStableHeight || window.innerHeight || 0);
      if (!lockedH) lockedH = next;
      else if (Math.abs(next - lockedH) < 72) next = lockedH;
      else lockedH = next;
      document.documentElement.style.setProperty("--app-height", next + "px");
      if (safeLocked) return;
      const top = (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || (tg.safeAreaInset && tg.safeAreaInset.top) || 0;
      const bottom = (tg.safeAreaInset && tg.safeAreaInset.bottom) || 0;
      document.documentElement.style.setProperty("--tg-safe-top", top + "px");
      document.documentElement.style.setProperty("--tg-safe-bottom", bottom + "px");
      if (top || bottom) safeLocked = true;
    };
    apply();
    if (tg.onEvent) {
      tg.onEvent("viewportChanged", apply);
      tg.onEvent("themeChanged", function () {
        if (document.cookie.match(/(?:^|; )vb_theme=(light|dark)/)) return;
        var darkNow = tg.colorScheme === "dark";
        document.documentElement.classList.toggle("dark", darkNow);
        if (tg.setHeaderColor) tg.setHeaderColor(darkNow ? "#1c1c1e" : "#ffffff");
        if (tg.setBackgroundColor) tg.setBackgroundColor(darkNow ? "#000000" : "#ffffff");
      });
    }
  } else {
    document.documentElement.style.setProperty("--app-height", window.innerHeight + "px");
  }

  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (btn.dataset.busy) return;
      btn.dataset.busy = "1";
      var fd = new FormData();
      fd.append("kind", btn.getAttribute("data-share-kind") || "");
      fd.append("pk", btn.getAttribute("data-share-pk") || "");
      var csrf = document.querySelector("[name=csrfmiddlewaretoken]");
      if (csrf) fd.append("csrfmiddlewaretoken", csrf.value);
      if (tg && tg.initData) fd.append("_tg_init", tg.initData);
      fetch("/share/", { method: "POST", body: fd, credentials: "same-origin" })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (data) {
          btn.dataset.busy = "";
          if (!data.ok) {
            haptic("error");
            var fail = "Не удалось поделиться. Откройте мини-приложение из бота.";
            if (tg && tg.showAlert) tg.showAlert(fail);
            else alert(fail);
            return;
          }
          haptic("success");
          var chat = data.bot ? ("https://t.me/" + data.bot) : "";
          var okMsg = "Карточка отправлена вам в чат с ботом. Перешлите её кому нужно.";
          if (tg && tg.showAlert) tg.showAlert(okMsg);
          else alert(okMsg);
          if (chat && tg && tg.openTelegramLink) {
            setTimeout(function () { tg.openTelegramLink(chat); }, 250);
          }
        })
        .catch(function () {
          btn.dataset.busy = "";
          haptic("error");
          if (tg && tg.showAlert) tg.showAlert("Не удалось поделиться");
          else alert("Не удалось поделиться");
        });
    });
  });

  document.querySelectorAll("[data-tg-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var href = a.getAttribute("href");
      try {
        if (tg && tg.openTelegramLink) tg.openTelegramLink(href);
        else window.open(href, "_blank");
      } catch (err) {
        window.location.href = href;
      }
    });
  });

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const scroller = root.querySelector("[data-scroller]");
    const thumbs = root.querySelectorAll("[data-thumb]");
    const counter = root.querySelector("[data-counter]");
    const thumbsRow = root.querySelector("[data-thumbs]");
    if (!scroller) return;
    function setIndex(i) {
      thumbs.forEach(function (btn, n) {
        if (n === i) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });
      if (counter) counter.textContent = i + 1 + " / " + thumbs.length;
      const active = thumbs[i];
      if (thumbsRow && active) {
        thumbsRow.scrollTo({ left: active.offsetLeft - thumbsRow.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
      }
    }
    scroller.addEventListener("scroll", function () {
      if (!scroller.clientWidth) return;
      const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
      setIndex(Math.max(0, Math.min(thumbs.length - 1, i)));
    });
    thumbs.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        scroller.scrollTo({ left: i * scroller.clientWidth, behavior: "smooth" });
        setIndex(i);
      });
    });
  });

  function askConfirm(msg, cb) {
    haptic("warning");
    var wrap = document.createElement("div");
    wrap.className = "confirm-mask";
    wrap.innerHTML = '<div class="confirm-box"><p></p><div class="confirm-actions"><button type="button" data-no>Отмена</button><button type="button" data-yes>Да</button></div></div>';
    wrap.querySelector("p").textContent = msg;
    function done(ok) {
      wrap.remove();
      cb(!!ok);
    }
    wrap.querySelector("[data-yes]").addEventListener("click", function () { done(true); });
    wrap.querySelector("[data-no]").addEventListener("click", function () { done(false); });
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) done(false);
    });
    document.body.appendChild(wrap);
  }

  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (form.dataset.confirmed) return;
      e.preventDefault();
      e.stopPropagation();
      askConfirm(form.getAttribute("data-confirm") || "Продолжить?", function (ok) {
        if (!ok) return;
        form.dataset.confirmed = "1";
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.submit();
      });
    });
  });

  var cats = document.querySelector(".js-cats");
  var cards = document.querySelector(".js-cards");
  var rails = document.querySelector(".cat-rails");
  var scroller = document.querySelector(".app-main");
  function markChip(a) {
    if (!cats || !a || a.classList.contains("chip-on")) return;
    cats.querySelectorAll("a").forEach(function (x) { x.classList.toggle("chip-on", x === a); });
    var left = a.offsetLeft - (cats.clientWidth - a.offsetWidth) / 2;
    cats.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }
  function scrollToSlug(slug) {
    if (!scroller) return;
    if (!slug) {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var target = document.querySelector('.cat-rail[data-slug="' + (window.CSS && CSS.escape ? CSS.escape(slug) : slug) + '"]');
    if (!target) return;
    var chipsH = cats ? cats.offsetHeight : 0;
    var top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - chipsH + 1;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
  if (cats && rails && scroller) {
    cats.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        markChip(a);
        scrollToSlug(a.getAttribute("data-slug") || "");
      });
    });
  } else if (cats && cards) {
    function fillCards(html, url) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var next = doc.querySelector(".js-cards");
      if (next && cards) cards.innerHTML = next.innerHTML;
      if (url) history.pushState({ cat: true }, "", url);
    }
    cats.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        cats.querySelectorAll("a").forEach(function (x) { x.classList.toggle("chip-on", x === a); });
        fetch(a.href, { headers: { "X-Requested-With": "XMLHttpRequest" } })
          .then(function (r) { return r.text(); })
          .then(function (html) { fillCards(html, a.href); })
          .catch(function () { location.href = a.href; });
      });
    });
    window.addEventListener("popstate", function () {
      fetch(location.href, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(function (r) { return r.text(); })
        .then(function (html) { fillCards(html); });
    });
  }

  document.querySelectorAll("form.add-form").forEach(function (form) {
    form.addEventListener("submit", function () {
      var btn = document.querySelector('button[form="' + form.id + '"]') || form.querySelector(".btn");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Сохранение…";
      }
    });
  });

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      if (img.dataset.retry) return;
      img.dataset.retry = "1";
      var src = img.getAttribute("src");
      if (!src) return;
      setTimeout(function () {
        img.src = src.split("?")[0] + "?r=" + Date.now();
      }, 500);
    });
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-thumb]")) return;
    var img = e.target.closest("[data-zoom]");
    if (!img || !img.getAttribute("src")) return;
    e.preventDefault();
    haptic("light");
    var box = document.createElement("div");
    box.className = "lightbox";
    var full = document.createElement("img");
    full.src = img.currentSrc || img.src;
    box.appendChild(full);
    box.addEventListener("click", function () { box.remove(); });
    document.body.appendChild(box);
  });

  document.querySelectorAll("form.review-form").forEach(function (form) {
    var btn = form.querySelector("[data-review-submit]");
    function sync() {
      var rated = !!form.querySelector("input[name=rating]:checked");
      var text = ((form.querySelector("textarea[name=text]") || {}).value || "").trim();
      if (btn) btn.hidden = !(rated || text);
    }
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    sync();
  });

  document.querySelectorAll("[data-fold]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = document.getElementById(btn.getAttribute("data-fold"));
      if (!box) return;
      var open = box.hidden;
      box.hidden = !open;
      haptic("select");
      btn.textContent = open ? "Свернуть" : (btn.getAttribute("data-more") || "Развернуть");
    });
  });

  document.addEventListener("pointerdown", function (e) {
    if (e.button && e.button !== 0) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("input:not([type=radio]):not([type=checkbox]), textarea, select")) return;
    var hit = t.closest("a, button, [role=button], .switch, .card, .market-card, .today-card, .review, .shortcuts a");
    if (!hit || hit.disabled) return;
    if (hit.closest(".app-nav")) { haptic("select"); return; }
    if (hit.closest(".chips") || hit.classList.contains("chip-opt")) { haptic("select"); return; }
    if (hit.closest(".stars") || hit.closest(".star-pick")) { haptic("select"); return; }
    if (hit.classList.contains("switch")) { haptic("soft"); return; }
    if (hit.closest(".cat-move")) { haptic("rigid"); return; }
    if (hit.closest(".card-del") || hit.classList.contains("del") || hit.hasAttribute("data-yes")) {
      haptic("heavy");
      return;
    }
    if (hit.hasAttribute("data-no")) { haptic("light"); return; }
    if (hit.classList.contains("btn") || hit.classList.contains("btn-contact") || hit.classList.contains("btn-support") || hit.classList.contains("cat-btn")) {
      haptic("medium");
      return;
    }
    if (hit.classList.contains("btn-share") || hit.classList.contains("icon-btn") || hit.classList.contains("edit-btn")) {
      haptic("light");
      return;
    }
    if (hit.classList.contains("card") || hit.classList.contains("market-card") || hit.classList.contains("today-card") || hit.classList.contains("review") || hit.closest(".shortcuts")) {
      haptic("soft");
      return;
    }
    haptic("light");
  }, { passive: true });
})();