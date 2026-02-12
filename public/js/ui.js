// public/js/ui.js
(() => {
  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(price) {
    const n = Number(price || 0);
    return `$${n.toFixed(2)}`;
  }

  function imageOrPlaceholder(images) {
    const first = Array.isArray(images) && images.length ? images[0] : "";
    if (first) return normalizeImageUrl(first);
    // fallback: use simple gradient placeholder
    return "";
  }

  function normalizeImageUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    // allow data/blob and http(s)
    if (/^(data:|blob:|https?:\/\/)/i.test(raw)) return raw;
    // protocol-relative
    if (raw.startsWith("//")) return `https:${raw}`;
    // common "www." links
    if (raw.startsWith("www.")) return `https://${raw}`;
    // looks like a domain/path but missing scheme
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(raw)) return `https://${raw}`;
    return raw;
  }

  function productCard(product, { liked = false, likedIds = null } = {}) {
    // Backward/forward compatibility:
    // - some pages pass { liked: true }
    // - catalog passes { likedIds: [...] }
    if (Array.isArray(likedIds)) liked = likedIds.includes(product._id);
    const img = imageOrPlaceholder(product.images);
    const imgHtml = img
      ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(product.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;"/>`
      : `<div class="ph" aria-label="Product image placeholder"></div>`;

    return `
      <article class="card product-card" data-product-id="${escapeHtml(product._id)}">
        <div class="product-card__media">
          ${imgHtml}
          <button class="product-card__like ${liked ? "is-liked" : ""}" aria-label="Like" data-like="${escapeHtml(product._id)}">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7-4.4-9.5-8.5C.8 9.5 2.2 6.6 5.2 6c1.8-.4 3.4.4 4.3 1.6.9-1.2 2.5-2 4.3-1.6 3 .6 4.4 3.5 2.7 6.5C19 16.6 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" ${liked ? 'fill="currentColor"' : ""}/>
            </svg>
          </button>
        </div>
        <div class="product-card__body">
          <div class="product-card__name">${escapeHtml(product.title)}</div>
          <div class="product-card__meta">
            <span class="u-muted">${escapeHtml(product.category?.name || "")}</span>
            <strong>${formatPrice(product.price)}</strong>
          </div>
          <div class="product-card__actions">
            <a class="btn btn--primary btn--sm" href="product.html?id=${escapeHtml(product._id)}">View</a>
            <button class="btn btn--outline btn--sm" type="button" data-add-cart>Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }

  window.ui = { escapeHtml, formatPrice, productCard };
})();
