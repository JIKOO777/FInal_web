document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  // Элементы интерфейса
  const listEl = document.getElementById("categoryList");
  const titleEl = document.getElementById("catTitle");
  const badgeEl = document.getElementById("catBadge");
  const bcEl = document.getElementById("catBreadcrumb");
  const countEl = document.getElementById("catCount");
  const sortEl = document.getElementById("sort");
  const searchEl = document.getElementById("catSearch");
  const searchBtn = document.getElementById("catSearchBtn");

  // Параметры URL
  const params = new URLSearchParams(window.location.search);
  const categoryParam = (params.get("category") || "").trim(); // Может быть slug (men) или ID
  const q = (params.get("q") || "").trim();
  const sort = params.get("sort") || "newest";
  const limit = params.get("limit") || "24";

  if (sortEl) sortEl.value = sort;
  if (searchEl) searchEl.value = q;

  const token = window.app.auth.getToken();
  const likedIds = token ? await window.app.getLikedIds() : [];

  // 1. Загружаем все категории для сайдбара и для поиска соответствия Slug -> ID
  let categories = [];
  try {
    const cats = await window.app.api("/api/categories?limit=100");
    categories = cats.items || cats || [];
  } catch (e) {
    console.error("Failed to load categories:", e);
  }

  // 2. Находим активную категорию (по slug или по ID)
  const activeCat = categories.find(c => c.slug === categoryParam || c._id === categoryParam) || null;
  
  // Если нашли категорию, используем её реальный ID для запроса товаров, чтобы бэкенд не выдал ошибку
  const categoryIdForApi = activeCat ? activeCat._id : categoryParam;
  const activeName = activeCat ? activeCat.name : (categoryParam ? "Category" : "All Products");

  // Обновляем заголовки на странице
  if (titleEl) titleEl.textContent = activeName;
  if (badgeEl) badgeEl.textContent = activeName;
  if (bcEl) bcEl.textContent = activeName;

  // 3. Рендерим сайдбар с категориями
  if (listEl) {
    if (categories.length === 0) {
      listEl.innerHTML = `<span class="u-muted">No categories</span>`;
    } else {
      listEl.innerHTML = categories.map((c) => {
        const val = c._id; // Всегда используем ID для ссылок в сайдбаре
        const isActive = val === categoryIdForApi;
        const cls = isActive ? "chip chip--active" : "chip";
        return `<a class="${cls}" href="category.html?category=${encodeURIComponent(val)}">${window.ui.escapeHtml(c.name)}</a>`;
      }).join("");
    }
  }

  // Функции фильтрации
  const apply = (nextParams) => {
    window.location.search = nextParams.toString();
  };

  sortEl?.addEventListener("change", () => {
    const next = new URLSearchParams(window.location.search);
    next.set("sort", sortEl.value);
    apply(next);
  });

  const doSearch = () => {
    const next = new URLSearchParams(window.location.search);
    if (searchEl.value.trim()) next.set("q", searchEl.value.trim());
    else next.delete("q");
    apply(next);
  };
  
  searchBtn?.addEventListener("click", doSearch);
  searchEl?.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

  // 4. Загрузка товаров
  grid.innerHTML = `<div class="card"><div class="card__body">Loading products...</div></div>`;

  try {
    const url = `/api/products?limit=${encodeURIComponent(limit)}`
      + (categoryIdForApi ? `&category=${encodeURIComponent(categoryIdForApi)}` : "")
      + (q ? `&q=${encodeURIComponent(q)}` : "")
      + (sort && sort !== "newest" ? `&sort=${encodeURIComponent(sort)}` : "");

    const data = await window.app.api(url);
    const items = data.items || [];
    
    if (countEl) countEl.textContent = `${data.total ?? items.length} items`;

    if (items.length === 0) {
      grid.innerHTML = `<div class="card"><div class="card__body">No products found in this category.</div></div>`;
      return;
    }

    // Рендер карточек через UI-kit
    grid.innerHTML = items.map(p => window.ui.productCard(p, { likedIds })).join("");
    wireLikeButtons(grid, likedIds);

  } catch (err) {
    grid.innerHTML = `<div class="card"><div class="card__body u-error">Error loading products. Please try again.</div></div>`;
    console.error("Products load error:", err);
  }

  // Функция для работы кнопок "Лайк"
function wireLikeButtons(root, likedIdsArr) {
  root.querySelectorAll("[data-like]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      // 1. Остановка перехода по ссылке и всплытия
      e.preventDefault(); 
      e.stopPropagation();

      if (!window.app.auth.getToken()) {
        window.location.href = "login.html";
        return;
      }

      const id = btn.getAttribute("data-like");
      
      // 2. Оптимистичное обновление UI (сразу меняем цвет, не ждем ответа сервера)
      const isCurrentlyLiked = btn.classList.contains("is-liked");
      if (isCurrentlyLiked) {
        btn.classList.remove("is-liked");
      } else {
        btn.classList.add("is-liked");
      }

      try {
        const res = await window.app.api(`/api/likes/${id}/toggle`, { 
          method: "POST", 
          authRequired: true 
        });

        // 3. Синхронизируем реальное состояние с сервера
        // Обновляем глобальный массив лайков (чтобы другие скрипты знали)
        likedIdsArr.length = 0;
        if (res.ids) res.ids.forEach(x => likedIdsArr.push(x));

        // Если сервер вернул состояние, отличное от того, что мы нарисовали — исправляем
        if (res.liked) btn.classList.add("is-liked");
        else btn.classList.remove("is-liked");

      } catch (err) {
        // Если ошибка — возвращаем как было
        console.error("Like toggle failed:", err);
        if (isCurrentlyLiked) btn.classList.add("is-liked");
        else btn.classList.remove("is-liked");
        alert("Could not save like. Please try again.");
      }
    });
  });
}
});