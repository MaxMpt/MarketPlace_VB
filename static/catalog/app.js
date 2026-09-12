(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
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
  document.cookie = "tg_user=" + encodeURIComponent(JSON.stringify(payload)) + ";path=/;max-age=31536000;samesite=lax";
  if (user && user.id && String(user.id) !== document.documentElement.dataset.uid) {
    location.reload();
    return;
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
    if (tg.onEvent) tg.onEvent("viewportChanged", apply);
  } else {
    document.documentElement.style.setProperty("--app-height", window.innerHeight + "px");
  }

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
})();
