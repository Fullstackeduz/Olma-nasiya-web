// Fake data (backend qo‘shilganda API dan olinadi)
let debts = [
  { id: 1, debtor: "Ali", amount: 50000, status: "To‘lanmagan" },
  { id: 2, debtor: "Vali", amount: 120000, status: "To‘langan" }
];

const debtList = document.getElementById("debt-list");
const debtForm = document.getElementById("debt-form");

// Qarzdorliklarni chiqarish
function renderDebts() {
  debtList.innerHTML = "";
  debts.forEach(debt => {
    debtList.innerHTML += `
      <tr>
        <td>${debt.debtor}</td>
        <td>${debt.amount} so'm</td>
        <td>${debt.status}</td>
        <td>
          <button onclick="markPaid(${debt.id})">To‘langan</button>
          <button onclick="deleteDebt(${debt.id})">O‘chirish</button>
        </td>
      </tr>
    `;
  });
}

// Qarz qo‘shish
debtForm.addEventListener("submit", e => {
  e.preventDefault();
  const debtor = document.getElementById("debtor").value;
  const amount = document.getElementById("amount").value;

  const newDebt = { id: Date.now(), debtor, amount, status: "To‘lanmagan" };
  debts.push(newDebt);

  debtForm.reset();
  renderDebts();
});

// Qarz to‘langan deb belgilash
function markPaid(id) {
  debts = debts.map(d => d.id === id ? { ...d, status: "To‘langan" } : d);
  renderDebts();
}

// Qarz o‘chirish
function deleteDebt(id) {
  debts = debts.filter(d => d.id !== id);
  renderDebts();
}

// Boshlang‘ich render
renderDebts();
