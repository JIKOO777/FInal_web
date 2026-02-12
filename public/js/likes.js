// public/js/likes.js
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("likesGrid");
  const empty = document.getElementById("likesEmpty");
  if (!grid) return;

  if (!window.app.auth.getToken()) {
    window.location.href = "login.html";
    return;
  }

  const likedIds = await window.app.getLikedIds();
  async function reload() {
    const data = await window.app.api("/api/likes", { authRequired: true });
    const items = data.items || [];
    if (items.length === 0) {
      grid.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";
    grid.innerHTML = items.map(p => window.ui.productCard(p, { likedIds })).join("");
    wire(grid);
  }

  function wire(root) {
    root.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-like");
        const res = await window.app.api(`/api/likes/${id}/toggle`, { method: "POST", authRequired: true });
        // refresh (removal likely)
        likedIds.length = 0;
        (res.ids || []).forEach((x) => likedIds.push(x));
        await reload();
      });
    });
  }

  await reload();
});
