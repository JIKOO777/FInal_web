// public/js/index.js
document.addEventListener("DOMContentLoaded", async () => {
  const featuredGrid = document.getElementById("featuredGrid");
  const arrivalsGrid = document.getElementById("arrivalsGrid");
  if (!featuredGrid && !arrivalsGrid) return;

  const token = window.app?.auth.getToken();
  const likedIds = token ? await window.app.getLikedIds() : [];

  async function load(limit, mount) {
    if (!mount) return;
    mount.innerHTML = "";
    const data = await window.app.api(`/api/products?limit=${limit}`);
    const items = data.items || [];
    if (items.length === 0) {
      mount.innerHTML = `<div class="card"><div class="card__body">No products yet.</div></div>`;
      return;
    }
    mount.innerHTML = items.map(p => window.ui.productCard(p, { likedIds })).join("");
    wireCardActions(mount, likedIds);
  }

  function wireCardActions(root, likedIdsArr) {
    root.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!window.app.auth.getToken()) {
          window.location.href = "login.html";
          return;
        }
        const id = btn.getAttribute("data-like");
        const res = await window.app.api(`/api/likes/${id}/toggle`, { method: "POST", authRequired: true });
        // update local liked ids
        likedIdsArr.length = 0;
        (res.ids || []).forEach((x) => likedIdsArr.push(x));
        // update icon state
        if (res.liked) btn.classList.add("is-liked");
        else btn.classList.remove("is-liked");
      });
    });
  }

  await load(4, featuredGrid);
  await load(4, arrivalsGrid);
});
