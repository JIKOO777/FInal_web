// public/js/admin/admin-dashboard.js
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

  // Try to update numbers if placeholders exist
  try {
    const [prod, cats] = await Promise.all([
      window.app.api("/api/products?limit=1"),
      window.app.api("/api/categories?limit=1")
    ]);
    const prodTotal = prod.total ?? prod.items?.length ?? 0;
    const catTotal = cats.total ?? cats.items?.length ?? 0;

    const cards = document.querySelectorAll(".admin-card__body");
    // first card: products, second: categories
    const numbers = document.querySelectorAll(".admin-card__body div[style*='font-size:28px']");
    if (numbers[0]) numbers[0].textContent = String(prodTotal);
    if (numbers[1]) numbers[1].textContent = String(catTotal);

    const pill = document.querySelector(".admin-pill");
    if (pill) pill.textContent = `Admin: ${me.user?.name || me.user?.email || ""}`;
  } catch {}
});
