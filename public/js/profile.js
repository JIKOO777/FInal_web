document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("profileBox");
  const avatarInput = document.getElementById("avatarInput");
  const userAvatar = document.getElementById("userAvatar");
  
  if (!box) return;

  if (!window.app.auth.getToken()) {
    window.location.href = "login.html";
    return;
  }

  // 1. Загрузка данных пользователя
  let u;
  try {
    const me = await window.app.api("/api/auth/profile", { authRequired: true });
    u = me.user;
  } catch (err) {
    console.error("Failed to fetch profile", err);
    return;
  }

  // Синхронизация данных
  const refreshSidebar = () => {
    document.getElementById("userNameSide").textContent = u.name;
    document.getElementById("userEmailSide").textContent = u.email;
    // Проверяем локальное хранилище, если сервер еще не сохранил фото
    const localAv = localStorage.getItem(`avatar_${u.email}`);
    userAvatar.src = localAv || u.avatar || "https://placehold.co/120x120?text=Avatar";
  };

  refreshSidebar();

  // 2. Логика табов
  const renderTab = (tabName) => {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('is-active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('is-active');

    if (tabName === 'details') {
      box.innerHTML = `
        <div class="card">
          <div class="card__header"><h3>Edit Profile</h3></div>
          <div class="card__body">
            <form id="editProfileForm" class="u-stack u-gap-md">
              <div class="filter__group">
                <label class="label">Full Name</label>
                <input type="text" class="input" name="name" value="${window.ui.escapeHtml(u.name)}" required>
              </div>
              <div class="filter__group">
                <label class="label">Email Address</label>
                <input type="email" class="input" name="email" value="${window.ui.escapeHtml(u.email)}" disabled style="background:#f5f5f5; cursor:not-allowed;">
                <p class="helper">Email identification is permanent.</p>
              </div>
              <button type="submit" class="btn btn--primary" id="saveProfileBtn">Save Changes</button>
            </form>
          </div>
        </div>
      `;
    } else if (tabName === 'cart') {
      // Подтягиваем товары из localStorage (если они там есть)
      const cart = JSON.parse(localStorage.getItem('wearly_cart') || '[]');
      box.innerHTML = `
        <div class="card">
          <div class="card__header"><h3>My Cart</h3></div>
          <div class="card__body">
            ${cart.length === 0 ? `
              <div class="u-align-center u-stack u-gap-md u-mt-4">
                <p class="u-muted">Your cart is currently empty.</p>
                <a href="catalog.html" class="btn btn--outline">Go Shopping</a>
              </div>
            ` : `<p>Items in cart: ${cart.length} (Checkout coming soon)</p>`}
          </div>
        </div>
      `;
    }
  };

  renderTab('details');

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => renderTab(btn.dataset.tab));
  });

  // 3. ЗАГРУЗКА ФОТО (с сохранением)
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      userAvatar.src = base64Image;
      
      // Сохраняем в localStorage, чтобы оно не пропадало после рефреша
      localStorage.setItem(`avatar_${u.email}`, base64Image);
      
      // Если твой API поддерживает смену аватара, раскомментируй это:
      /*
      try {
        await window.app.api("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify({ avatar: base64Image }),
          authRequired: true
        });
      } catch (e) { console.log("Server avatar update failed, saved locally instead"); }
      */
      alert("Avatar updated!");
    };
    reader.readAsDataURL(file);
  });

  // 4. СОХРАНЕНИЕ ПРОФИЛЯ
  box.addEventListener('submit', async (e) => {
    if (e.target.id === 'editProfileForm') {
      e.preventDefault();
      const btn = document.getElementById("saveProfileBtn");
      const formData = new FormData(e.target);
      const data = { name: formData.get('name').trim() };

      if (!data.name) return alert("Name cannot be empty");

      btn.disabled = true;
      btn.textContent = "Saving...";

      try {
        // Пробуем отправить на сервер
        const res = await window.app.api("/api/auth/profile", { 
          method: "PATCH", // В некоторых API может быть PUT
          body: JSON.stringify(data),
          authRequired: true 
        });
        
        if (res.error) throw new Error(res.error);

        alert("Profile updated successfully!");
        u.name = data.name; // Обновляем локально
        refreshSidebar();
      } catch (err) {
        console.error(err);
        alert("Server error. Note: Name changed only locally for this session.");
        document.getElementById("userNameSide").textContent = data.name;
      } finally {
        btn.disabled = false;
        btn.textContent = "Save Changes";
      }
    }
  });
});