// main/script.js (moved from scripts/posts.js)
// Загружает посты с сервера и вставляет их в ленту

/**
 * Преобразует объект поста в DOM-элемент с нужной вёрсткой.
 * @param {Object} post
 * @param {string} post.authorName
 * @param {string} post.authorAvatar
 * @param {string} post.content  // HTML-строка или текст
 * @param {number} post.likes
 * @param {number} post.comments
 * @returns {HTMLElement}
 */
function createPostElement(post) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('post-card');

  wrapper.innerHTML = `
    <div class="post-author-info">
      <img src="${post.authorAvatar || 'img/profile-pic.jpg'}" alt="" class="post-author-avatar" />
      <p class="post-author-name">${post.authorName}</p>
    </div>
    <div class="post-card-content">
      <p class="post-card-text">${post.content}</p>
    </div>
    <div class="post-card-actions">
      <button type="button" class="button post-action-button button--primary">
        <div class="icon-container">
          <!-- heart icon duplicated to allow css hover fill -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path d="M20.84 4.61c-.51-.511-1.116-.916-1.784-1.193A4.977 4.977 0 0 0 16.95 3a4.977 4.977 0 0 0-2.106.417 5.04 5.04 0 0 0-1.844 1.193L12 5.67l-1.06-1.06A5.04 5.04 0 0 0 9.094 3.417 4.977 4.977 0 0 0 7.05 3C5.59 3 4.192 3.58 3.16 4.61a5.044 5.044 0 0 0-1.611 3.89c0 1.339.534 2.621 1.611 3.79L12 21.23l8.84-8.94a5.044 5.044 0 0 0 1.611-3.79 5.044 5.044 0 0 0-1.611-3.89Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="a"><rect width="24" height="24" fill="#fff"/></clipPath></defs></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#b)"><path d="M20.84 4.61c-.51-.511-1.116-.916-1.784-1.193A4.977 4.977 0 0 0 16.95 3a4.977 4.977 0 0 0-2.106.417 5.04 5.04 0 0 0-1.844 1.193L12 5.67l-1.06-1.06A5.04 5.04 0 0 0 9.094 3.417 4.977 4.977 0 0 0 7.05 3C5.59 3 4.192 3.58 3.16 4.61a5.044 5.044 0 0 0-1.611 3.89c0 1.339.534 2.621 1.611 3.79L12 21.23l8.84-8.94a5.044 5.044 0 0 0 1.611-3.79 5.044 5.044 0 0 0-1.611-3.89Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="b"><rect width="24" height="24" fill="#fff"/></clipPath></defs></svg>
        </div>
        <span>${post.likes}</span>
      </button>
      <button type="button" class="button post-action-button">Комментарии ${post.comments}</button>
    </div>
  `;
  return wrapper;
}

/** Возвращает набор мок-постов для отображения без бэкенда */
function getMockPosts() {
  return [
    {
      authorName: 'Alice',
      authorAvatar: '',
      content: 'Привет, это мок-пост №1! 🎉',
      likes: 5,
      comments: 2,
    },
    {
      authorName: 'Bob',
      authorAvatar: '',
      content: 'Сегодня отличный день, делюсь новостью.',
      likes: 3,
      comments: 1,
    },
    {
      authorName: 'Charlie',
      authorAvatar: '',
      content: 'Ищу напарника для проекта — пишите в личку!',
      likes: 7,
      comments: 4,
    },
  ];
}

/** Рендерит массив постов в контейнер */
function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  if (!container) return;
  container.innerHTML = '';
  posts.forEach((p) => container.appendChild(createPostElement(p)));
}

/**
 * Загружает посты и размещает их на странице
 */
async function loadPosts() {
  try {
    const res = await fetch('http://localhost:3000/posts', { credentials: 'include' });
    if (!res.ok) throw new Error('Ошибка загрузки постов');
    const data = await res.json();

    // Сервер может вернуть массив постов или объект вида { posts: [...] }
    const posts = Array.isArray(data) ? data : data.posts || [];
    let normalized = posts.map((raw) => ({
      authorName: raw.authorName || raw.author || raw.username || raw.author_name || 'Аноним',
      authorAvatar: raw.authorAvatar || raw.avatarUrl || raw.avatar || 'img/profile-pic.jpg',
      content: raw.content || raw.text || raw.body || '',
      likes: raw.likes ?? raw.likeCount ?? 0,
      comments: raw.comments ?? raw.commentCount ?? 0,
    }));

    // Если бэкенд вернул пусто — покажем мок-данные
    if (!normalized.length) {
      normalized = getMockPosts();
    }

    renderPosts(normalized);
  } catch (e) {
    console.error(e);
    // При ошибке бэкенда — тоже отображаем мок-данные
    renderPosts(getMockPosts());
  }
}

window.addEventListener('DOMContentLoaded', loadPosts);
