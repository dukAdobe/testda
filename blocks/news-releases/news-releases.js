const API_URL = 'https://demo.investorroom.com/api/newsfeed_releases/list.php?format=json';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderList(releases) {
  const ul = document.createElement('ul');
  ul.className = 'news-releases-list';

  releases.forEach(({ headline, releaseDate }) => {
    const li = document.createElement('li');
    li.className = 'news-releases-item';

    const dateEl = document.createElement('time');
    dateEl.className = 'news-releases-date';
    dateEl.dateTime = new Date(releaseDate).toISOString().slice(0, 10);
    dateEl.textContent = formatDate(releaseDate);

    const headlineEl = document.createElement('p');
    headlineEl.className = 'news-releases-headline';
    headlineEl.textContent = headline;

    li.append(dateEl, headlineEl);
    ul.append(li);
  });

  return ul;
}

/**
 * loads and decorates the news-releases block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  block.innerHTML = '';

  const loading = document.createElement('p');
  loading.className = 'news-releases-loading';
  loading.textContent = 'Loading news releases…';
  block.append(loading);

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const releases = data.release || [];

    loading.remove();

    if (!releases.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No news releases found.';
      block.append(empty);
      return;
    }

    block.append(renderList(releases));
  } catch {
    loading.remove();
    const err = document.createElement('p');
    err.className = 'news-releases-error';
    err.textContent = 'Unable to load news releases. Please try again later.';
    block.append(err);
  }
}
