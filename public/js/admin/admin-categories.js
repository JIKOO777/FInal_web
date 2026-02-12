// public/js/admin/admin-categories.js
document.addEventListener("DOMContentLoaded", async () => {
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
    const data = await window.app.api("/api/categories?limit=100");
    const items = data.items || data || [];
    tbody.innerHTML = items.map((c) => {
      return `
        <tr>
          <td style="font-weight:900;">${window.ui.escapeHtml(c.name)}</td>
          <td>${window.ui.escapeHtml(c.slug || "")}</td>
          <td>
            <a class="admin-btn" href="admin-category-form.html?id=${window.ui.escapeHtml(c._id)}">Edit</a>
            <button class="admin-btn" type="button" data-del="${window.ui.escapeHtml(c._id)}">Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete category?")) return;
        await window.app.api(`/api/categories/${id}`, { method: "DELETE", authRequired: true });
        await load();
      });
    });
  }

  await load();
});

