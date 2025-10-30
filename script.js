const form = document.getElementById("invoiceForm");
const resultBox = document.getElementById("conversionResult");
const invoiceList = document.getElementById("invoiceList");

async function fetchCryptoPrice(cryptoId) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
    const data = await res.json();
    return data[cryptoId].usd;
  } catch (err) {
    console.error("Error fetching crypto price:", err);
    return null;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const client = document.getElementById("clientName").value;
  const usdAmount = parseFloat(document.getElementById("usdAmount").value);
  const crypto = document.getElementById("cryptoSelect").value;

  if (!client || !usdAmount) {
    alert("Please fill in all fields.");
    return;
  }

  const price = await fetchCryptoPrice(crypto);
  if (!price) {
    resultBox.textContent = "Failed to fetch live price. Try again later.";
    return;
  }

  const cryptoAmount = (usdAmount / price).toFixed(6);
  const result = `${usdAmount} USD ≈ ${cryptoAmount} ${crypto.toUpperCase()}`;

  resultBox.textContent = result;

  // Save invoice in localStorage
  const invoice = {
    id: Date.now(),
    client,
    usdAmount,
    crypto,
    cryptoAmount,
    date: new Date().toLocaleString()
  };

  const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
  invoices.push(invoice);
  localStorage.setItem("invoices", JSON.stringify(invoices));

  displayInvoices();
  form.reset();
});

function displayInvoices() {
  const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
  if (invoices.length === 0) {
    invoiceList.innerHTML = "<p>No invoices yet. Create one above!</p>";
    return;
  }

  invoiceList.innerHTML = "";
  invoices.forEach(inv => {
    const div = document.createElement("div");
    div.className = "invoice-item";
    div.innerHTML = `
      <strong>${inv.client}</strong><br>
      $${inv.usdAmount} → ${inv.cryptoAmount} ${inv.crypto.toUpperCase()}<br>
      <small>${inv.date}</small>
    `;
    invoiceList.appendChild(div);
  });
}

window.onload = displayInvoices;
