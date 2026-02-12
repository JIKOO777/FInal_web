// public/js/admin/admin-product-form.js
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

  const params = new URLSearchParams(location.search);
  const id = params.get("id"); // edit

  const $ = (sel) => document.querySelector(sel);
  const titleEl = $("#p-name");
  const priceEl = $("#p-price");
  const descEl = $("#p-desc");
  const catEl = $("#p-cat");
  const imgEl = $("#p-img-url");
  const previewEl = $("#p-img-preview");
  const saveBtn = document.querySelector('button.admin-btn--accent');

const normalizeImageUrl = (url) => {
  let raw = String(url || "").trim();
  if (!raw) return "";

  // 1. Если это Base64 или уже полный URL, возвращаем как есть
  // Важно: проверяем ^data: первым, чтобы не испортить его дальнейшими проверками
  if (/^data:/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;

  // 2. Если начинается с // (protocol-relative)
  if (raw.startsWith("//")) return "https:" + raw;

  // 3. Если это просто домен (например, img.com/1.jpg)
  // Проверяем на наличие точки, но исключаем случаи, когда это путь от корня
  if (raw.includes(".") && !raw.startsWith("/")) {
    return "https://" + raw;
  }

  return raw;
};

const parseImages = (val) => {
  const raw = String(val || "").trim();
  if (!raw) return [];

  // Если в строке есть "data:", то запятые внутри нее игнорируем, 
  // разделяем только по переносу строки.
  // Если Base64 нет, можно оставить разделение по запятой.
  let lines;
  if (raw.includes("data:")) {
    lines = raw.split(/\n+/); // Разделяем только энтером
  } else {
    lines = raw.split(/[,\n]+/); // Обычные ссылки делим и так, и так
  }

  return lines
    .map((s) => s.trim())
    .filter((s) => s.length > 10) // Игнорируем слишком короткие обрубки
    .map(normalizeImageUrl);
};

const setPreview = (url) => {
  if (!previewEl) return;
  if (!url) {
    previewEl.style.display = "none";
    previewEl.src = "";
    return;
  }
  // Используем результат нормализации
  const validUrl = normalizeImageUrl(url);
  previewEl.src = validUrl;
  previewEl.style.display = "block";
  
  // Обработка ошибки, если URL все равно битый
  previewEl.onerror = () => {
    previewEl.style.display = "none";
    console.error("Failed to load image:", validUrl);
  };
};


  // load categories
  const cats = await window.app.api("/api/categories?limit=100");
  const items = cats.items || cats || [];
  if (catEl) {
    catEl.innerHTML = items.map(c => `<option value="${c._id}">${window.ui.escapeHtml(c.name)}</option>`).join("");
  }

  // load product if edit
if (id) {
    const product = await window.app.api(`/api/products/${id}`);
    if (titleEl) titleEl.value = product.title || "";
    if (priceEl) priceEl.value = product.price ?? "";
    if (descEl) descEl.value = product.description || "";
    if (catEl) catEl.value = product.category?._id || product.category || "";
    
    // --- ИСПРАВЛЕНИЕ ДЛЯ РАЗМЕРОВ ---
if (product.sizes && Array.isArray(product.sizes)) {
  const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
  sizeCheckboxes.forEach(cb => {
    // Берем текст из родительского label и очищаем от лишних пробелов
    const sizeText = cb.parentElement.textContent.trim(); 
    
    if (product.sizes.includes(sizeText)) {
      cb.checked = true;
    }
  });
}

    // -------------------------------

    if (imgEl) imgEl.value = (product.images || []).join(", ");
    setPreview((product.images && product.images[0]) ? product.images[0] : "");
  }

  imgEl?.addEventListener("input", () => {
    const first = parseImages(imgEl.value)[0] || "";
    setPreview(first);
  });

  saveBtn?.addEventListener("click", async () => {
const selectedSizes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.parentElement.textContent.trim())
      // Фильтруем, чтобы не захватить чекбокс "Featured", если он тоже чекбокс
      .filter(val => ["S", "M", "L", "XL"].includes(val));

    const body = {
      title: titleEl?.value?.trim(),
      price: Number(priceEl?.value || 0),
      description: descEl?.value?.trim(),
      category: catEl?.value,
      images: parseImages(imgEl?.value),
      sizes: selectedSizes // Добавляем массив размеров в тело запроса
    };

    if (!body.title || !body.category || Number.isNaN(body.price)) {
      alert("Fill title, price, category");
      return;
    }

    if (id) {
      await window.app.api(`/api/products/${id}`, { method: "PUT", authRequired: true, body });
    } else {
      await window.app.api(`/api/products`, { method: "POST", authRequired: true, body });
    }
    window.location.href = "admin-products.html";
  });
});
