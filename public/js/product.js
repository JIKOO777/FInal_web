/**
 * Утилита для нормализации ссылок (теперь внутри файла для надежности)
 */
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
  
  // Чтобы обновить экран, находим кнопку корзины и "кликаем" по ней программно
  const cartBtn = document.querySelector('[data-tab="cart"]');
  if (cartBtn) cartBtn.click();
};

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("productRoot");
  const breadcrumbName = document.getElementById("bc-product-name");
  const breadcrumbCat = document.getElementById("bc-cat");

  if (!root) return;

  // 1. Получаем ID из URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    root.innerHTML = `<div class="card"><div class="card__body">Product ID is missing in URL.</div></div>`;
    return;
  }

  root.innerHTML = `<div class="card"><div class="card__body">Loading product details...</div></div>`;

  try {
    // 2. Загружаем данные (Лайки + Товар)
    const token = window.app?.auth?.getToken();
    const likedIds = token ? await window.app.getLikedIds() : [];
    const product = await window.app.api(`/api/products/${id}`);

    if (!product || product.error) {
      throw new Error("Product not found");
    }

    // 3. Подготовка данных
    const firstImg = (product.images && product.images.length > 0) 
      ? normalizeImageUrl(product.images[0]) 
      : "https://placehold.co/600x600?text=No+Image";
    
    const isLiked = likedIds.includes(product._id);

    // 4. Обновляем хлебные крошки
    if (breadcrumbName) breadcrumbName.textContent = product.title || "Product";
    if (breadcrumbCat && product.category) {
      breadcrumbCat.textContent = product.category.name || "Category";
      breadcrumbCat.href = `category.html?category=${product.category._id || product.category}`;
    }

    // 5. Отрисовываем основной HTML
    root.innerHTML = `
      <div class="gallery">
        <div class="gallery__main">
          <img id="mainImage" src="${firstImg}" alt="${window.ui.escapeHtml(product.title)}" 
               style="width:100%; height:100%; object-fit:cover; border-radius:16px;">
        </div>
        <div class="gallery__thumbs" style="display: flex; gap: 10px; margin-top: 15px; overflow-x: auto;">
          ${(product.images || []).map((i, index) => `
            <div class="gallery__thumb-item" style="cursor:pointer; width:80px; height:80px; flex-shrink:0;">
              <img src="${normalizeImageUrl(i)}" 
                   class="thumb-img"
                   style="width:100%; height:100%; object-fit:cover; border-radius:8px; border: 2px solid ${index === 0 ? 'var(--accent)' : 'transparent'}">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="u-stack">
        <div class="u-between u-wrap">
          <h1 class="page-title" style="margin:0;">${window.ui.escapeHtml(product.title)}</h1>
          <button class="product-card__like ${isLiked ? "is-liked" : ""}" data-like="${product._id}" style="background:none; border:none; cursor:pointer;">
            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" style="width:28px; height:28px;">
              <path d="M12 21s-7-4.4-9.5-8.5C.8 9.5 2.2 6.6 5.2 6c1.8-.4 3.4.4 4.3 1.6.9-1.2 2.5-2 4.3-1.6 3 .6 4.4 3.5 2.7 6.5C19 16.6 12 21 12 21z" 
                    stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="u-row u-wrap u-gap-md u-mt-2">
          <strong style="font-size:28px;">${window.ui.formatPrice(product.price)}</strong>
          ${product.category ? `<span class="badge badge--success">${window.ui.escapeHtml(product.category.name)}</span>` : ""}
        </div>

        <div class="u-mt-6">
          <div class="u-between">
            <h3 style="font-size:14px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); font-weight:700;">Select Size</h3>
            <a href="#" style="font-size:12px; color:var(--accent); text-decoration:none; border-bottom:1px solid currentColor;">Size Guide</a>
          </div>
          
          <div class="u-row u-wrap u-mt-2" style="gap:12px;" id="sizeSelector">
            ${(() => {
              // Если в базе нет размеров, используем стандартный набор
              const availableSizes = (product.sizes && product.sizes.length > 0) 
                ? product.sizes 
                : ['XS', 'S', 'M', 'L', 'XL'];
              
              return availableSizes.map(size => `
                <button class="size-chip" data-size="${size}">
                  ${size}
                </button>
              `).join('');
            })()}
          </div>
        </div>

        <div class="u-mt-6">
          <h3 style="font-size:14px; text-transform:uppercase; color:var(--muted);">Description</h3>
          <p class="subtle u-mt-2" style="line-height:1.6;">${window.ui.escapeHtml(product.description || "No description provided.")}</p>
        </div>

        <div class="u-row u-wrap u-gap-md u-mt-8">
          <button class="btn btn--primary btn--lg" id="addToBagBtn" style="flex:1" ${product.sizes?.length > 0 ? 'disabled' : ''}>
            ${product.sizes?.length > 0 ? 'Select Size' : 'Add to Bag'}
          </button>
          <a class="btn btn--outline btn--lg" href="catalog.html">Back to Catalog</a>
        </div>
      </div>
    `;

    // 6. ЛОГИКА ВЫБОРА РАЗМЕРА
    const sizeButtons = root.querySelectorAll("[data-size]");
    const addToBagBtn = document.getElementById("addToBagBtn");
    let selectedSize = product.sizes?.length > 0 ? null : "One Size";

    sizeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach(b => {
            b.classList.remove("chip--active");
            b.style.backgroundColor = "";
            b.style.color = "";
        });
        btn.classList.add("chip--active");
        // Ручная подсветка если CSS chip--active не подтянулся
        btn.style.backgroundColor = "var(--text)";
        btn.style.color = "var(--surface)";
        
        selectedSize = btn.getAttribute("data-size");
        if (addToBagBtn) {
          addToBagBtn.disabled = false;
          addToBagBtn.textContent = `Add to Bag — ${selectedSize}`;
        }
      });
    });

    // 7. ЛОГИКА ЛАЙКА
    const likeBtn = root.querySelector("[data-like]");
    likeBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!window.app.auth.getToken()) {
        window.location.href = "login.html";
        return;
      }
      const active = likeBtn.classList.toggle("is-liked");
      const svg = likeBtn.querySelector('svg');
      svg.setAttribute('fill', active ? 'currentColor' : 'none');
      
      try {
        await window.app.api(`/api/likes/${id}/toggle`, { method: "POST", authRequired: true });
      } catch (err) {
        likeBtn.classList.toggle("is-liked", !active);
        svg.setAttribute('fill', !active ? 'currentColor' : 'none');
      }
    });

    // 8. ПЕРЕКЛЮЧЕНИЕ ФОТО
    const mainImg = document.getElementById("mainImage");
    root.querySelectorAll(".gallery__thumb-item").forEach(thumbContainer => {
      thumbContainer.addEventListener("click", () => {
        const newSrc = thumbContainer.querySelector('img').src;
        mainImg.src = newSrc;
        // Подсветка активной миниатюры
        root.querySelectorAll(".thumb-img").forEach(img => img.style.borderColor = "transparent");
        thumbContainer.querySelector('img').style.borderColor = "var(--accent)";
      });
    });

    // 9. КНОПКА ДОБАВЛЕНИЯ
  addToBagBtn?.addEventListener("click", () => {
    // Формируем объект товара для корзины
    const cartItem = {
      id: product._id,
      title: product.title,
      price: product.price,
      size: selectedSize,
      image: (product.images && product.images.length > 0) ? product.images[0] : null,
      addedAt: new Date().getTime()
    };

    // Получаем текущую корзину из localStorage
    const currentCart = JSON.parse(localStorage.getItem('wearly_cart') || '[]');
    
    // Добавляем новый товар
    currentCart.push(cartItem);
    
    // Сохраняем обратно
    localStorage.setItem('wearly_cart', JSON.stringify(currentCart));

    alert(`Success! Added to bag: ${product.title} (Size: ${selectedSize})`);
    
    // Опционально: можно сразу перенаправить в профиль, чтобы увидеть результат
    // window.location.href = 'profile.html'; 
  });

  } catch (err) {
    console.error("Product Page Error:", err);
    root.innerHTML = `<div class="card u-error"><div class="card__body">Error: ${err.message}. Please check your connection.</div></div>`;
  }
});