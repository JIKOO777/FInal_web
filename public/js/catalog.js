document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  // Элементы UI
  const categorySelect = document.getElementById("f-category");
  const minPriceInput = document.getElementById("f-minprice");
  const maxPriceInput = document.getElementById("f-maxprice");
  const applyBtn = document.getElementById("f-apply");
  const sortSelect = document.getElementById("sort");
  const countBadge = document.querySelector('.badge:last-of-type');
  const sizeInputs = document.querySelectorAll('input[name="size"]');

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
  const sizeParam = params.get("sizes") || "";

  // --- ШАГ 1: Инициализация размеров ---
  const activeSizes = sizeParam ? sizeParam.split(",") : [];
  
  sizeInputs.forEach(input => {
    // Устанавливаем начальное состояние из URL
    if (activeSizes.includes(input.value)) {
      input.checked = true;
      input.closest('.chip-checkbox').querySelector('.chip').classList.add("chip--active");
    }

    // Слушатель для визуального переключения чипа
    input.addEventListener('change', () => {
      const chip = input.closest('.chip-checkbox').querySelector('.chip');
      if (input.checked) {
        chip.classList.add("chip--active");
      } else {
        chip.classList.remove("chip--active");
      }
    });
  });

  // --- Загрузка категорий ---
  let categoryIdForApi = categoryParam;
  try {
    const cats = await window.app.api("/api/categories");
    const categories = cats.items || cats || [];
    if (categorySelect) {
      categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c._id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    }
    const found = categories.find(c => c.slug === categoryParam || c._id === categoryParam);
    if (found) {
      categoryIdForApi = found._id;
      if (categorySelect) categorySelect.value = found._id;
    }
  } catch (e) { console.error("Categories load failed", e); }

  if (minPriceInput) minPriceInput.value = minPrice;
  if (maxPriceInput) maxPriceInput.value = maxPrice;
  if (sortSelect) sortSelect.value = sort;

  // --- ШАГ 2: Применение фильтров ---
  const applyFilters = () => {
    const next = new URLSearchParams();

    if (q) next.set("q", q);

    const catVal = categorySelect?.value;
    if (catVal) next.set("category", catVal);

    // Выбранные размеры
    const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked'))
                               .map(i => i.value);
    if (selectedSizes.length > 0) {
      next.set("sizes", selectedSizes.join(","));
    }

    const minV = minPriceInput?.value.trim();
    if (minV) next.set("minPrice", minV);

    const maxV = maxPriceInput?.value.trim();
    if (maxV) next.set("maxPrice", maxV);

    const sortV = sortSelect?.value || "newest";
    if (sortV !== "newest") next.set("sort", sortV);

    // Перезагрузка страницы с новыми параметрами
    window.location.search = next.toString();
  };

  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);

  // --- ШАГ 3: Загрузка товаров ---
  grid.innerHTML = `<div class="card u-p-6">Loading products...</div>`;

  try {
    let apiUrl = `/api/products?limit=${encodeURIComponent(limit)}`;
    if (q) apiUrl += `&q=${encodeURIComponent(q)}`;
    if (categoryIdForApi) apiUrl += `&category=${encodeURIComponent(categoryIdForApi)}`;
    if (sizeParam) apiUrl += `&sizes=${encodeURIComponent(sizeParam)}`;
    if (minPrice) apiUrl += `&minPrice=${encodeURIComponent(minPrice)}`;
    if (maxPrice) apiUrl += `&maxPrice=${encodeURIComponent(maxPrice)}`;
    if (sort && sort !== "newest") apiUrl += `&sort=${encodeURIComponent(sort)}`;

    const data = await window.app.api(apiUrl);
    const items = data.items || [];

    if (countBadge) countBadge.textContent = `Showing ${items.length} items`;

    grid.innerHTML = items.length
      ? items.map(p => window.ui.productCard(p, { likedIds })).join("")
      : `<div class="card u-p-6">No products match your filters.</div>`;

    wireLikeButtons(grid, likedIds);
  } catch (err) {
    grid.innerHTML = `<div class="card u-p-6 u-error">Error loading catalog.</div>`;
    console.error(err);
  }

  // --- Функция лайков ---
  function wireLikeButtons(root, likedIdsArr) {
    root.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault(); 
        if (!window.app.auth.getToken()) {
          window.location.href = "login.html";
          return;
        }
        const id = btn.getAttribute("data-like");
        btn.classList.toggle("is-liked");
        try {
          const res = await window.app.api(`/api/likes/${id}/toggle`, { method: "POST", authRequired: true });
          likedIdsArr.length = 0;
          if (res.ids) res.ids.forEach(x => likedIdsArr.push(x));
        } catch (err) {
          btn.classList.toggle("is-liked");
          alert("Could not save like.");
        }
      });
    });
  }
});
