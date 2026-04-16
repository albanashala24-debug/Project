const detailStatus = document.getElementById("detailStatus");
const productDetail = document.getElementById("productDetail");
const backLink = document.querySelector(".back-link");
const mainProductImage = document.getElementById("mainProductImage");
const thumbnailRow = document.getElementById("thumbnailRow");
const detailCategory = document.getElementById("detailCategory");
const detailTitle = document.getElementById("detailTitle");
const detailDescription = document.getElementById("detailDescription");
const detailPrice = document.getElementById("detailPrice");
const detailDiscount = document.getElementById("detailDiscount");
const detailRating = document.getElementById("detailRating");
const detailTags = document.getElementById("detailTags");
const detailReviews = document.getElementById("detailReviews");
const CATALOG_URL_KEY = "productExplorer.catalogUrl";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatReviewDate(rawDate) {
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

function updateMainImage(imageUrl, title) {
  mainProductImage.src = imageUrl;
  mainProductImage.alt = title;

  document.querySelectorAll(".thumbnail-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.image === imageUrl);
  });
}

function renderImages(images, title) {
  const gallery = images?.length
    ? images
    : ["https://via.placeholder.com/600x600?text=No+Image"];
  updateMainImage(gallery[0], title);

  thumbnailRow.innerHTML = gallery
    .map(
      (image, index) => `
        <button
          type="button"
          class="thumbnail-button ${index === 0 ? "active" : ""}"
          data-image="${image}"
          aria-label="Show product image ${index + 1}"
        >
          <img class="thumbnail-image" src="${image}" alt="${title} preview ${index + 1}" />
        </button>
      `
    )
    .join("");

  thumbnailRow.querySelectorAll(".thumbnail-button").forEach((button) => {
    button.addEventListener("click", () => {
      updateMainImage(button.dataset.image, title);
    });
  });
}

function renderTags(tags) {
  if (!tags?.length) {
    detailTags.innerHTML = '<span class="tag-pill">No tags available</span>';
    return;
  }

  detailTags.innerHTML = tags
    .map((tag) => `<span class="tag-pill">${tag}</span>`)
    .join("");
}

function renderReviews(reviews) {
  if (!reviews?.length) {
    detailReviews.innerHTML =
      '<article class="review-card"><strong>No reviews yet</strong><p>Customer reviews are not available for this product.</p></article>';
    return;
  }

  detailReviews.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-heading">
            <strong>${review.reviewerName}</strong>
            <span class="review-meta">${formatReviewDate(review.date)} | ${review.rating}/5</span>
          </div>
          <p>${review.comment}</p>
        </article>
      `
    )
    .join("");
}

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const backParams = new URLSearchParams();
  const page = params.get("page");
  const search = params.get("search");
  const sort = params.get("sort");

  if (page) {
    backParams.set("page", page);
  }

  if (search) {
    backParams.set("search", search);
  }

  if (sort) {
    backParams.set("sort", sort);
  }

  const storedCatalogUrl = window.sessionStorage.getItem(CATALOG_URL_KEY);
  const fallbackHref = backParams.toString()
    ? `./index.html?${backParams.toString()}`
    : "./index.html";
    backLink.href = storedCatalogUrl || fallbackHref;
  backLink.addEventListener("click", (event) => {
    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });

  if (!productId) {
    detailStatus.textContent = "No product ID was provided.";
    return;
  }

  try {
    const response = await fetch(`https://dummyjson.com/products/${productId}`);

    if (!response.ok) {
      throw new Error("Unable to fetch product details.");
    }

    const product = await response.json();
    document.title = `${product.title} | Product Explorer`;
    detailCategory.textContent = product.category;
    detailTitle.textContent = product.title;
    detailDescription.textContent = product.description;
    detailPrice.textContent = formatPrice(product.price);
    detailDiscount.textContent = `${product.discountPercentage}% off`;
    detailRating.textContent = `${product.rating}/5`;

    renderImages(product.images, product.title);
    renderTags(product.tags);
    renderReviews(product.reviews);

    detailStatus.classList.add("hidden");
    productDetail.classList.remove("hidden");
  } catch (error) {
    detailStatus.textContent =
      "Something went wrong while loading this product. Please return to the catalog and try another item.";
  }
}

loadProductDetails();
