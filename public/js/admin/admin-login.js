// public/js/admin/admin-login.js
// This UI template had an "admin login" page. We reuse the regular login.
// If user already logged in as ADMIN -> go to dashboard.
document.addEventListener("DOMContentLoaded", async () => {
  const token = window.app.auth.getToken();
  if (!token) {
    window.location.href = "../login.html";
    return;
  }
  try {
    const me = await window.app.api("/api/auth/profile", { authRequired: true });
    if (me.user?.role === "ADMIN") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "../index.html";
    }
  } catch {
    window.app.auth.clear();
    window.location.href = "../login.html";
  }
});
