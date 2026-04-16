const API_BASE = "https://dummyjson.com/products";
const PAGE_SIZE = 12;

const elements = {
  filtersForm: document.getElementById("filtersForm"),
  searchInput: document.getElementById("searchInput"),
  clearSearchButton: document.getElementById("clearSearchButton"),
  sortSelect: document.getElementById("sortSelect"),
  resetButton: document.getElementById("resetButton"),
  resultsSummary: document.getElementById("resultsSummary"),
  statusMessage: document.getElementById("statusMessage"),
  productGrid: document.getElementById("productGrid"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  pageIndicator: document.getElementById("pageIndicator"),
  pageHint: document.getElementById("pageHint"),
};

const state = {
  page: 1,
  total: 0,
  search: "",
  sort: "",
  products: [],
  isLoading: false,
};

let searchDebounceId = null;
const CATALOG_URL_KEY = "productExplorer.catalogUrl";
const CATALOG_SCROLL_KEY = "productExplorer.catalogScroll";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function buildUrl() {
  const skip = (state.page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
  });

  if (state.sort) {
    params.set("sortBy", "price");
    params.set("order", state.sort);
  }

  if (state.search) {
    params.set("q", state.search);
    return `${API_BASE}/search?${params.toString()}`;
  }

  return `${API_BASE}?${params.toString()}`;
}

function syncQueryString() {
  const params = new URLSearchParams();
  params.set("page", String(state.page));

  if (state.search) {
    params.set("search", state.search);
  }

  if (state.sort) {
    params.set("sort", state.sort);
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", nextUrl);
}

function updateSearchAffordances() {
  elements.clearSearchButton.classList.toggle("hidden", !elements.searchInput.value.trim());
}

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  state.page = Number.isInteger(page) && page > 0 ? page : 1;
  state.search = params.get("search")?.trim() ?? "";
  state.sort = params.get("sort") ?? "";

  elements.searchInput.value = state.search;
  elements.sortSelect.value = state.sort;
  updateSearchAffordances();
}

function restoreCatalogScroll() {
  const storedUrl = window.sessionStorage.getItem(CATALOG_URL_KEY);
  const storedScroll = window.sessionStorage.getItem(CATALOG_SCROLL_KEY);
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (storedUrl === currentUrl && storedScroll !== null) {
    window.requestAnimationFrame(() => {
      window.scrollTo(0, Number(storedScroll));
      window.sessionStorage.removeItem(CATALOG_SCROLL_KEY);
    });
  }
}

function attachProductLinkHandlers() {
  document.querySelectorAll('[data-product-link="true"]').forEach((link) => {
    link.addEventListener("click", () => {
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      window.sessionStorage.setItem(CATALOG_URL_KEY, currentUrl);
      window.sessionStorage.setItem(CATALOG_SCROLL_KEY, String(window.scrollY));
    });
  });
}

function renderProducts() {
  if (!state.products.length) {
    elements.productGrid.innerHTML = "";
    elements.statusMessage.textContent = "No products matched your filters. Try a broader search or reset the controls.";
    elements.pageHint.textContent = "Adjust the search or reset the filters to see more results.";
    return;
  }

  elements.statusMessage.textContent = "";
  elements.productGrid.innerHTML = state.products
   .map((product) => {
      const detailParams = new URLSearchParams({
        id: String(product.id),
        page: String(state.page),
      });

      if (state.search) {
        detailParams.set("search", state.search);
      }

      if (state.sort) {
        detailParams.set("sort", state.sort);
      }

      return `
        <a class="product-card" data-product-link="true" href="./product.html?${detailParams.toString()}">
          <img
            class="product-thumb"
            src="${product.thumbnail}"
            alt="${product.title}"
            loading="lazy"
          />
          <div class="product-content">
            <p class="product-category">${product.category}</p>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <span class="product-link-copy">Open product details</span>
          </div>
        </a>
       `;
      })
    .join("");
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  const prevInactive = state.isLoading || state.page <= 1;
  const nextInactive = state.isLoading || state.page >= totalPages;
  elements.pageIndicator.textContent = `Page ${state.page} of ${totalPages}`;
  elements.prevButton.setAttribute("aria-disabled", String(prevInactive));
  elements.nextButton.setAttribute("aria-disabled", String(nextInactive));
  elements.prevButton.classList.toggle("is-disabled", prevInactive);
  elements.nextButton.classList.toggle("is-disabled", nextInactive);
  const rangeStart = state.total === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(state.page * PAGE_SIZE, state.total);
  elements.resultsSummary.textContent = `Showing ${rangeStart}-${rangeEnd} of ${state.total} products`;
  elements.pageHint.textContent =
    state.total > PAGE_SIZE
      ? "Use Previous and Next to move through the catalog."
      : "All matching products fit on this page.";
}

async function loadProducts() {
  state.isLoading = true;
  elements.statusMessage.textContent = "Loading products...";
  renderPagination();

  try {
    const response = await fetch(buildUrl());

    if (!response.ok) {
      throw new Error("Unable to fetch products.");
    }

    const data = await response.json();
    state.products = data.products ?? [];
    state.total = data.total ?? 0;

    const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
    if (state.page > totalPages) {
      state.page = totalPages;
      syncQueryString();
      return loadProducts();
    }

    renderProducts();
    attachProductLinkHandlers();
    syncQueryString();
  } catch (error) {
    elements.productGrid.innerHTML = "";
    elements.resultsSummary.textContent = "Results unavailable";
    elements.pageIndicator.textContent = "Page unavailable";
    elements.statusMessage.textContent =
      "Something went wrong while loading products. Please try again.";
    } finally {
    state.isLoading = false;
    renderPagination();
  }
}

elements.filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = elements.searchInput.value.trim();
  state.sort = elements.sortSelect.value;
  state.page = 1;
  loadProducts();
});

elements.searchInput.addEventListener("input", () => {
  updateSearchAffordances();
  clearTimeout(searchDebounceId);
  searchDebounceId = window.setTimeout(() => {
    const nextSearch = elements.searchInput.value.trim();
    if (nextSearch === state.search) {
      return;
    }

    state.search = nextSearch;
    state.page = 1;
    loadProducts();
  }, 300);
});

elements.searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    state.search = elements.searchInput.value.trim();
    state.page = 1;
    loadProducts();
  }
});

elements.clearSearchButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  state.search = "";
  state.page = 1;
  updateSearchAffordances();
  loadProducts();
});

elements.sortSelect.addEventListener("change", () => {
  state.sort = elements.sortSelect.value;
  state.page = 1;
  loadProducts();
});

elements.resetButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.sortSelect.value = "";
  state.search = "";
  state.sort = "";
  state.page = 1;
  updateSearchAffordances();
  loadProducts();
});

elements.prevButton.addEventListener("click", () => {
    if (!state.isLoading && state.page > 1) {
    state.page -= 1;
    loadProducts();
  }
});

elements.nextButton.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
    if (!state.isLoading && state.page < totalPages) {
    state.page += 1;
    loadProducts();
  }
});

readInitialState();
loadProducts();
restoreCatalogScroll();
