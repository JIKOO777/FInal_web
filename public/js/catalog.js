document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  // Элементы UI
  const categorySelect = document.getElementById("f-category");
  const minPriceInput = document.getElementById("f-minprice");
  const maxPriceInput = document.getElementById("f-maxprice");
  const applyBtn = document.getElementById("f-apply");
  const sortSelect = document.getElementById("sort");
  const countBadge = document.querySelector('.badge:last-of-type'); // Счетчик товаров

  const token = window.app.auth.getToken();
  const likedIds = token ? await window.app.getLikedIds() : [];

  // Параметры из URL
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const categoryParam = params.get("category") || ""; 
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sort = params.get("sort") || "newest";
  const limit = params.get("limit") || "24";

  // --- ШАГ 1: Загружаем категории и сопоставляем ID ---
  let categories = [];
  let categoryIdForApi = categoryParam;

  try {
    const cats = await window.app.api("/api/categories");
    categories = cats.items || cats || [];

    if (categorySelect) {
      categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c._id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    }

    // Если categoryParam — это slug (например, "women"), находим его _id
    const found = categories.find(c => c.slug === categoryParam || c._id === categoryParam);
    if (found) {
      categoryIdForApi = found._id;
      if (categorySelect) categorySelect.value = found._id;
    }
  } catch (e) {
    console.error("Categories load failed", e);
  }

  // Заполняем остальные поля фильтров
  if (minPriceInput) minPriceInput.value = minPrice;
  if (maxPriceInput) maxPriceInput.value = maxPrice;
  if (sortSelect) sortSelect.value = sort;

  // --- ШАГ 2: Функция применения фильтров ---
  const applyFilters = () => {
    const next = new URLSearchParams(); // Создаем чистые параметры
    
    if (q) next.set("q", q);
    
    const catVal = categorySelect?.value;
    if (catVal) next.set("category", catVal);
    
    const minV = minPriceInput?.value.trim();
    if (minV) next.set("minPrice", minV);
    
    const maxV = maxPriceInput?.value.trim();
    if (maxV) next.set("maxPrice", maxV);
    
    const sortV = sortSelect?.value || "newest";
    if (sortV !== "newest") next.set("sort", sortV);

    window.location.search = next.toString();
  };

  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);

  // --- ШАГ 3: Загрузка товаров ---
  grid.innerHTML = `<div class="card"><div class="card__body">Loading products...</div></div>`;

  try {
    const url = `/api/products?limit=${encodeURIComponent(limit)}`
      + (q ? `&q=${encodeURIComponent(q)}` : "")
      + (categoryIdForApi ? `&category=${encodeURIComponent(categoryIdForApi)}` : "")
      + (minPrice ? `&minPrice=${encodeURIComponent(minPrice)}` : "")
      + (maxPrice ? `&maxPrice=${encodeURIComponent(maxPrice)}` : "")
      + (sort && sort !== "newest" ? `&sort=${encodeURIComponent(sort)}` : "");

    const data = await window.app.api(url);
    const items = data.items || [];

    if (countBadge) countBadge.textContent = `Showing ${items.length} items`;

    if (items.length === 0) {
      grid.innerHTML = `<div class="card"><div class="card__body">No products match your filters.</div></div>`;
      return;
    }

    grid.innerHTML = items.map(p => window.ui.productCard(p, { likedIds })).join("");
    wireLikeButtons(grid, likedIds);

  } catch (err) {
    grid.innerHTML = `<div class="card"><div class="card__body u-error">Error loading catalog. Please try again.</div></div>`;
    console.error(err);
  }

  // Лайки
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