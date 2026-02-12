// public/js/admin/admin-products.js
document.addEventListener("DOMContentLoaded", async () => {
  // guard
  if (!window.app.auth.getToken()) {
    window.location.href = "../login.html";
    return;
  }
  const me = await window.app.api("/api/auth/profile", { authRequired: true });
  if (me.user?.role !== "ADMIN") {
    window.location.href = "../index.html";
    return;
  }

  const tbody = document.querySelector("table.admin-table tbody");
  if (!tbody) return;

  async function load() {
    const data = await window.app.api("/api/products?limit=100");
    const items = data.items || [];
    tbody.innerHTML = items
      .map((p) => {
        const img = (p.images && p.images[0]) ? `background-image:url('${p.images[0]}'); background-size:cover;` : "";
        return `
          <tr>
            <td><div class="table__img" style="${img}"></div></td>
            <td style="font-weight:900;">${window.ui.escapeHtml(p.title)}</td>
            <td>$${Number(p.price || 0).toFixed(2)}</td>
            <td><span class="admin-pill">—</span></td>
            <td>${window.ui.escapeHtml(p.category?.name || "")}</td>
            <td>
              <a class="admin-btn" href="admin-product-form.html?id=${p._id}">Edit</a>
              <button class="admin-btn" type="button" data-del="${p._id}">Delete</button>
            </td>
          </tr>`;
      })
      .join("");

    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this product?")) return;
        await window.app.api(`/api/products/${id}`, { method: "DELETE", authRequired: true });
        await load();
      });
    });
  }

  await load();
});
