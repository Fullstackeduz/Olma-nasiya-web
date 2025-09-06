// script.js - frontend behaviours for site + auth + debt CRUD
// Basic navigation for login overlay (if present)
document.addEventListener('DOMContentLoaded', () => {
  // overlay buttons for login page
  const signInBtn = document.getElementById("signIn");
  const signUpBtn = document.getElementById("signUp");
  const firstForm = document.getElementById("form1");
  const secondForm = document.getElementById("form2");
  const container = document.querySelector(".container.right-panel-active") || document.querySelector(".container");

  if (signInBtn && signUpBtn && container) {
    signInBtn.addEventListener("click", () => container.classList.remove("right-panel-active"));
    signUpBtn.addEventListener("click", () => container.classList.add("right-panel-active"));
  }

  // Auth forms
  const btnSignup = document.getElementById('btnSignup');
  const btnSignin = document.getElementById('btnSignin');

  const API_BASE = '/api';

  async function postJSON(url, data, token) {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      body: JSON.stringify(data)
    });
    return r.json();
  }

  async function getJSON(url, token) {
    const r = await fetch(url, {
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      }
    });
    return r.json();
  }

  if (btnSignup) {
    btnSignup.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = document.getElementById('su_username').value;
      const email = document.getElementById('su_email').value;
      const password = document.getElementById('su_password').value;
      if (!username || !email || !password) return alert('Iltimos barcha maydonlarni to\'ldiring');
      const res = await postJSON(API_BASE + '/auth/register', { username, email, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        alert('Ro\'yxatdan o\'tish muvaffaqiyatli!');
        window.location.href = '/';
      } else {
        alert(res.error || 'Xatolik');
      }
    });
  }

  if (btnSignin) {
    btnSignin.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('si_email').value;
      const password = document.getElementById('si_password').value;
      if (!email || !password) return alert('Iltimos barcha maydonlarni to\'ldiring');
      const res = await postJSON(API_BASE + '/auth/login', { email, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        alert('Kirish muvaffaqiyatli!');
        window.location.href = '/';
      } else {
        alert(res.error || 'Xatolik');
      }
    });
  }

  // If on a page that manages debtors (you can create a separate dashboard later),
  // we can use token to fetch and manipulate debtors.
  // Example helper:
  window.api = {
    async getDebtors() {
      const token = localStorage.getItem('token');
      return getJSON(API_BASE + '/debtors', token);
    },
    async addDebtor(data) {
      const token = localStorage.getItem('token');
      return postJSON(API_BASE + '/debtors', data, token);
    },
    async updateDebtor(id, data) {
      const token = localStorage.getItem('token');
      const r = await fetch(API_BASE + '/debtors/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(data)
      });
      return r.json();
    },
    async deleteDebtor(id) {
      const token = localStorage.getItem('token');
      const r = await fetch(API_BASE + '/debtors/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      return r.json();
    }
  };
});
