function normalizeImageUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "https://placehold.co/600x600?text=No+Image";
  if (/^(data:|blob:|https?:\/\/)/i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("www.")) return `https://${raw}`;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(raw)) return `https://${raw}`;
  return raw;
}

window.removeFromCart = (index) => {
  const cart = JSON.parse(localStorage.getItem('wearly_cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('wearly_cart', JSON.stringify(cart));
  const cartBtn = document.querySelector('[data-tab="cart"]');
  if (cartBtn) cartBtn.click();
};

document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("profileBox");
  const avatarInput = document.getElementById("avatarInput");
  const userAvatar = document.getElementById("userAvatar");

  if (!box) return;

  if (!window.app.auth.getToken()) {
    window.location.href = "login.html";
    return;
  }

  let u;

  const refreshSidebar = () => {
    if (!u) return;
    document.getElementById("userNameSide").textContent = u.name;
    document.getElementById("userEmailSide").textContent = u.email;
    const localAv = localStorage.getItem(`avatar_${u.email}`);
    userAvatar.src = localAv || u.avatar || "https://placehold.co/120x120?text=Avatar";
  };

  // Загрузка профиля с сервера
  try {
    const me = await window.app.api("/api/auth/profile", { authRequired: true });
    u = me.user;
    refreshSidebar();
  } catch (err) {
    console.error("Ошибка загрузки профиля:", err);
    box.innerHTML = '<p class="u-error">Failed to load profile data.</p>';
    return;
  }

  const renderTab = (tabName) => {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('is-active'));
    const currentBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (currentBtn) currentBtn.classList.add('is-active');

    if (tabName === 'details') {
      box.innerHTML = `
        <div class="card">
          <div class="card__header"><h3>Personal Details</h3></div>
          <div class="card__body">
            <form id="editProfileForm" class="u-stack u-gap-md">
              <div class="filter__group">
                <label class="label">Full Name (max 30 chars)</label>
                <input type="text" class="input" name="name" value="${window.ui.escapeHtml(u.name)}" maxlength="30" required>
              </div>
              <div class="filter__group">
                <label class="label">Email Address</label>
                <input type="email" class="input" value="${window.ui.escapeHtml(u.email)}" disabled style="background:#f5f5f5;">
              </div>
              <button type="submit" class="btn btn--primary" id="saveProfileBtn">Save Changes</button>
            </form>
          </div>
        </div>`;
    } 
    else if (tabName === 'cart') {
      const cart = JSON.parse(localStorage.getItem('wearly_cart') || '[]');
      if (cart.length === 0) {
        box.innerHTML = `
          <div class="card"><div class="card__body u-align-center">
            <p class="u-muted">Cart is empty.</p>
            <a href="catalog.html" class="btn btn--outline u-mt-2">Shop Now</a>
          </div></div>`;
      } else {
        const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
        box.innerHTML = `
          <div class="card">
            <div class="card__header"><h3>My Cart (${cart.length})</h3></div>
            <div class="card__body">
              <div class="u-stack u-gap-md">
                ${cart.map((item, index) => `
                  <div class="card" style="flex-direction: row; align-items: center; padding: 1rem; gap: 1rem; border: 1px solid var(--border);">
                    <img src="${normalizeImageUrl(item.image)}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;">
                    <div style="flex: 1;">
                      <h4 style="margin: 0;">${window.ui.escapeHtml(item.title)}</h4>
                      <p class="subtle" style="margin: 4px 0;">Size: ${item.size}</p>
                      <strong>${window.ui.formatPrice(item.price)}</strong>
                    </div>
                    <button class="btn btn--sm btn--outline u-error" onclick="removeFromCart(${index})">Remove</button>
                  </div>
                `).join('')}
                <div class="u-between u-mt-4" style="border-top: 1px solid var(--border); padding-top: 1rem;">
                   <strong>Total: ${window.ui.formatPrice(total)}</strong>
                </div>
              </div>
            </div>
          </div>`;
      }
    } 
    else if (tabName === 'orders') {
      box.innerHTML = `<div class="card"><div class="card__body u-muted">No orders yet.</div></div>`;
    }
  };

  renderTab('details');

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      renderTab(btn.dataset.tab);
    });
  });

  avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      userAvatar.src = base64Image;
      localStorage.setItem(`avatar_${u.email}`, base64Image);
    };
    reader.readAsDataURL(file);
  });

  // Сохранение профиля
  box.addEventListener('submit', async (e) => {
    if (e.target.id !== 'editProfileForm') return;
    e.preventDefault();

    const btn = document.getElementById("saveProfileBtn");
    const formData = new FormData(e.target);
    const newName = formData.get('name')?.trim();

    if (!newName || newName.length < 2 || newName.length > 30) {
      return alert("Name must be between 2 and 30 characters");
    }

    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      const res = await window.app.api("/api/auth/profile", {
        method: "PUT",
        body: { name: newName },
        authRequired: true
      });

      u.name = res.user.name;
      refreshSidebar();
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      u.name = newName;
      localStorage.setItem(`name_backup_${u.email}`, newName);
      refreshSidebar();
      alert("⚠️ Server unavailable, name saved locally.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Changes";
    }
  });
});
