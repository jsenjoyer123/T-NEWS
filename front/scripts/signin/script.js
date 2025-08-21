// signin/script.js (moved from scripts/auth.js)
// Client-side authentication logic using Fetch API

/**
 * @typedef {Object} Credentials
 * @property {string} username
 * @property {string} password
 */

/**
 * Отправить POST-запрос на указанный URL с учётными данными пользователя.
 * @param {string} url
 * @param {Credentials} credentials
 * @returns {Promise<any>}
 */
async function sendAuthRequest(url, credentials) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // важно для работы с куки
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Неизвестная ошибка');
    }

    return data;
  } catch (error) {
    console.error('Ошибка:', error);
    alert(error.message || 'Ошибка сети');
    return null;
  }
}

/**
 * Обработчик клика на кнопку «Войти»
 * @param {MouseEvent} ev
 */
async function handleLogin(ev) {
  ev.preventDefault();
  const { username, password } = getCredentials();
  if (!username || !password) return;

  try {
    const data = await sendAuthRequest('http://localhost:3000/login', { username, password });
    alert(data?.message);
    window.location.href = 'http://localhost:8080/main.html'; 
  } catch (e) {
    // уже показано внутри sendAuthRequest, здесь просто выходим
  }
}

/**
 * Обработчик клика на кнопку «Зарегистрироваться»
 * @param {MouseEvent} ev
 */
async function handleSignup(ev) {
  ev.preventDefault();
  const { username, password } = getCredentials();
  if (!username || !password) return;

  try {
    const data = await sendAuthRequest('http://localhost:3000/register', { username, password });
    alert(data?.message);
  } catch (e) {
    // ошибка уже обработана
  }
}

/** Возвращает введённые пользователем логин и пароль */
function getCredentials() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  /** @type {string} */
  const username = usernameInput.value.trim();
  /** @type {string} */
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert('Пожалуйста, заполните логин и пароль');
    return { username: '', password: '' };
  }

  return { username, password };
}

// Инициализация обработчиков после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (signupBtn) signupBtn.addEventListener('click', handleSignup);
});
