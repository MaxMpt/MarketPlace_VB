(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
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
    var go = "";
    var sm = String(startParam).match(/^s(\d+)$/);
    var cm = String(startParam).match(/^c(\d+)$/);
    if (sm) go = "/services/" + sm[1] + "/";
    if (cm) go = "/companies/" + cm[1] + "/";
    if (go && location.pathname !== go) {
      location.replace(go);
      return;
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
    const apply = function () {
      if (tg.isExpanded === false) tg.expand();
      const h = tg.viewportStableHeight || (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", Math.round(h) + "px");
      const top = (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || (tg.safeAreaInset && tg.safeAreaInset.top) || 0;
      const bottom = (tg.safeAreaInset && tg.safeAreaInset.bottom) || 0;
      document.documentElement.style.setProperty("--tg-safe-top", top + "px");
      document.documentElement.style.setProperty("--tg-safe-bottom", bottom + "px");
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
    btn.addEventListener("click", function () {
      var fd = new FormData();
      fd.append("kind", btn.getAttribute("data-share-kind") || "");
      fd.append("pk", btn.getAttribute("data-share-pk") || "");
      if (tg && tg.initData) fd.append("_tg_init", tg.initData);
      btn.disabled = true;
      fetch("/share/", { method: "POST", body: fd, credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          btn.disabled = false;
          if (!data.ok) {
            if (tg && tg.showAlert) tg.showAlert("Не удалось поделиться. Откройте каталог из бота.");
            else alert("Не удалось поделиться");
            return;
          }
          var chat = data.bot ? ("https://t.me/" + data.bot) : "";
          if (tg && tg.showPopup) {
            tg.showPopup(
              { message: "Карточка отправлена вам в чат с ботом. Перешлите её кому нужно." },
              function () {
                if (chat && tg.openTelegramLink) tg.openTelegramLink(chat);
              }
            );
          } else if (chat && tg && tg.openTelegramLink) {
            tg.openTelegramLink(chat);
          } else if (chat) {
            window.open(chat, "_blank");
          }
        })
        .catch(function () {
          btn.disabled = false;
          if (tg && tg.showAlert) tg.showAlert("Не удалось поделиться");
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

  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (form.dataset.confirmed) return;
      e.preventDefault();
      var msg = form.getAttribute("data-confirm");
      var go = function (ok) {
        if (!ok) return;
        form.dataset.confirmed = "1";
        form.submit();
      };
      if (tg && tg.showConfirm) tg.showConfirm(msg, go);
      else go(window.confirm(msg));
    });
  });

  var cats = document.querySelector(".js-cats");
  var cards = document.querySelector(".js-cards");
  function fillCards(html, url) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var next = doc.querySelector(".js-cards");
    if (next && cards) cards.innerHTML = next.innerHTML;
    if (url) history.pushState({ cat: true }, "", url);
  }
  if (cats && cards) {
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
    var box = document.createElement("div");
    box.className = "lightbox";
    var full = document.createElement("img");
    full.src = img.currentSrc || img.src;
    box.appendChild(full);
    box.addEventListener("click", function () { box.remove(); });
    document.body.appendChild(box);
  });

  document.querySelectorAll("[data-fold]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = document.getElementById(btn.getAttribute("data-fold"));
      if (!box) return;
      var open = box.hidden;
      box.hidden = !open;
      btn.textContent = open ? "Свернуть" : (btn.getAttribute("data-more") || "Развернуть");
    });
  });

  var hideBar = document.querySelector(".js-hide-bar");
  var scroller = document.querySelector(".app-main");
  if (hideBar && scroller) {
    var lastY = 0;
    scroller.addEventListener("scroll", function () {
      var y = scroller.scrollTop;
      if (y > lastY + 8 && y > 48) hideBar.classList.add("is-hidden");
      else if (y < lastY - 8) hideBar.classList.remove("is-hidden");
      lastY = y;
    }, { passive: true });
  }
})();
