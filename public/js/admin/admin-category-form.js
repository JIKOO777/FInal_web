// public/js/admin/admin-category-form.js
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

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const nameEl = document.getElementById("c-name");
  const slugEl = document.getElementById("c-slug");
  const descEl = document.getElementById("c-desc");
  const saveBtn = document.querySelector("button[type='button']");
  const cancelLink = document.querySelector("a[href='admin-categories.html']");

  if (!nameEl || !slugEl || !saveBtn) return;

  if (id) {
    const cat = await window.app.api(`/api/categories/${id}`);
    nameEl.value = cat.name || "";
    slugEl.value = cat.slug || "";
    if (descEl) descEl.value = cat.description || "";
  }

  saveBtn.addEventListener("click", async () => {
    const payload = {
      name: nameEl.value.trim(),
      slug: slugEl.value.trim(),
      description: descEl ? descEl.value.trim() : ""
    };
    if (!payload.name) {
      alert("Name is required");
      return;
    }
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, "-");

    if (id) {
      await window.app.api(`/api/categories/${id}`, { method: "PUT", authRequired: true, body: payload });
    } else {
      await window.app.api(`/api/categories`, { method: "POST", authRequired: true, body: payload });
    }
    window.location.href = "admin-categories.html";
  });

  if (cancelLink) {
    cancelLink.addEventListener("click", () => {
      // nothing
    });
  }
});
