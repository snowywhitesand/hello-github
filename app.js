const STORAGE_KEY = 'crystal-keeper-collection';

const crystalCatalog = [
  { name: 'Amethyst', benefits: 'Calm, intuition, spiritual awareness, and restful energy.' },
  { name: 'Rose Quartz', benefits: 'Love, compassion, emotional healing, and self-care.' },
  { name: 'Clear Quartz', benefits: 'Clarity, amplification, focus, and intention setting.' },
  { name: 'Citrine', benefits: 'Abundance, confidence, creativity, and joy.' },
  { name: 'Black Tourmaline', benefits: 'Protection, grounding, energetic boundaries, and stability.' },
  { name: 'Selenite', benefits: 'Cleansing, peace, energetic clearing, and charging other crystals.' },
  { name: 'Fluorite', benefits: 'Mental clarity, concentration, study support, and decision-making.' },
  { name: 'Carnelian', benefits: 'Motivation, courage, vitality, and passion.' },
  { name: 'Labradorite', benefits: 'Transformation, intuition, protection, and inner strength.' },
  { name: 'Moonstone', benefits: 'New beginnings, emotional balance, intuition, and reflection.' },
  { name: 'Tiger\'s Eye', benefits: 'Confidence, grounding, courage, and practical focus.' },
  { name: 'Aquamarine', benefits: 'Communication, soothing energy, courage, and flow.' },
  { name: 'Smoky Quartz', benefits: 'Grounding, release, protection, and stress relief.' },
  { name: 'Jade', benefits: 'Prosperity, harmony, luck, and heart-centered balance.' },
  { name: 'Obsidian', benefits: 'Protection, truth, grounding, and energetic clearing.' }
];

const form = document.getElementById('crystalForm');
const collectionList = document.getElementById('collectionList');
const catalogList = document.getElementById('catalogList');
const catalogSearch = document.getElementById('catalogSearch');
const catalogStatus = document.getElementById('catalogStatus');
const collectionSummary = document.getElementById('collectionSummary');
const template = document.getElementById('collectionItemTemplate');

let collection = loadCollection();

function loadCollection() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCollection() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

function normaliseName(value) {
  return value.trim().toLowerCase();
}

function getCatalogBenefits(name) {
  const match = crystalCatalog.find((item) => normaliseName(item.name) === normaliseName(name));
  return match?.benefits ?? 'Add your own benefits or crystal meaning notes.';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Not provided';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function renderSummary() {
  const totalSpent = collection.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const uniqueCrystals = new Set(collection.map((item) => normaliseName(item.name))).size;

  collectionSummary.innerHTML = `
    <p class="eyebrow">Collection summary</p>
    <h2>${collection.length} piece${collection.length === 1 ? '' : 's'} tracked</h2>
    <div class="summary-card__stats">
      <div class="summary-card__stat">
        <strong>${uniqueCrystals}</strong>
        <span>Unique crystals</span>
      </div>
      <div class="summary-card__stat">
        <strong>${formatCurrency(totalSpent)}</strong>
        <span>Total spent</span>
      </div>
    </div>
  `;
}

function renderCollection() {
  collectionList.innerHTML = '';

  if (!collection.length) {
    collectionList.innerHTML = '<div class="empty-state">No crystals saved yet. Add your first purchase to start your tracker.</div>';
    return;
  }

  collection
    .slice()
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .forEach((item) => {
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector('.collection-card');
      const image = fragment.querySelector('.collection-card__image');
      const imageFallback = fragment.querySelector('.collection-card__image-fallback');
      const title = fragment.querySelector('.collection-card__title');
      const subtitle = fragment.querySelector('.collection-card__subtitle');
      const notes = fragment.querySelector('.collection-card__notes');
      const metaList = fragment.querySelector('.meta-list');
      const deleteButton = fragment.querySelector('.icon-button');

      title.textContent = item.name;
      subtitle.textContent = item.form;
      notes.textContent = item.notes || item.benefits;

      if (item.image) {
        image.src = item.image;
        image.hidden = false;
        imageFallback.hidden = true;
      } else {
        image.hidden = true;
        imageFallback.hidden = false;
      }

      const fields = [
        ['Price paid', formatCurrency(item.price)],
        ['Bought from', item.store || 'Not provided'],
        ['Purchase date', formatDate(item.purchaseDate)],
        ['Link', item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer">Open listing</a>` : 'Not provided'],
        ['Benefits', item.benefits || 'Not provided']
      ];

      metaList.innerHTML = fields
        .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
        .join('');

      deleteButton.addEventListener('click', () => {
        collection = collection.filter((entry) => entry.id !== item.id);
        saveCollection();
        renderApp();
      });

      collectionList.appendChild(card);
    });
}

function renderCatalog() {
  const query = normaliseName(catalogSearch.value);
  const ownedNames = new Set(collection.map((item) => normaliseName(item.name)));
  const matchingItems = crystalCatalog.filter((item) => item.name.toLowerCase().includes(query));

  catalogList.innerHTML = '';

  if (query) {
    const owned = ownedNames.has(query);
    catalogStatus.textContent = owned
      ? `Yes — you already own ${catalogSearch.value.trim()}.`
      : `No exact match in your collection for "${catalogSearch.value.trim()}" yet.`;
  } else {
    catalogStatus.textContent = 'Browse common crystals and see which ones are already in your collection.';
  }

  if (!matchingItems.length) {
    catalogList.innerHTML = '<div class="empty-state">No catalogue entries match that search yet.</div>';
    return;
  }

  matchingItems.forEach((item) => {
    const owned = ownedNames.has(normaliseName(item.name));
    const card = document.createElement('article');
    card.className = 'catalog-card';
    card.innerHTML = `
      <div class="catalog-card__header">
        <div>
          <h3>${item.name}</h3>
          <p>${item.benefits}</p>
        </div>
        <span class="badge ${owned ? 'badge--owned' : 'badge--missing'}">${owned ? 'Owned' : 'Not owned'}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      form.name.value = item.name;
      if (!form.benefits.value.trim()) {
        form.benefits.value = item.benefits;
      }
      form.name.focus();
    });
    catalogList.appendChild(card);
  });
}

function renderApp() {
  renderSummary();
  renderCollection();
  renderCatalog();
}

async function fileToDataUrl(file) {
  if (!file) return '';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const file = form.image.files[0];
  const crystal = {
    id: crypto.randomUUID(),
    name: form.name.value.trim(),
    form: form.form.value.trim(),
    price: form.price.value,
    store: form.store.value.trim(),
    link: form.link.value.trim(),
    purchaseDate: form.purchaseDate.value,
    benefits: form.benefits.value.trim() || getCatalogBenefits(form.name.value),
    notes: form.notes.value.trim(),
    image: await fileToDataUrl(file)
  };

  collection = [crystal, ...collection];
  saveCollection();
  form.reset();
  renderApp();
});

catalogSearch.addEventListener('input', renderCatalog);
form.name.addEventListener('blur', () => {
  if (!form.benefits.value.trim() && form.name.value.trim()) {
    form.benefits.value = getCatalogBenefits(form.name.value);
  }
});

renderApp();
