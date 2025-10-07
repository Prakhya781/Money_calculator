// Data: Denominations per country
const COUNTRIES = [
  {
    code: "IN",
    name: "India (INR)",
    symbol: "₹",
    notes: [2000, 500, 200, 100, 50, 20, 10],
    coins: [20, 10, 5, 2, 1],
  },
  {
    code: "US",
    name: "United States (USD)",
    symbol: "$",
    notes: [100, 50, 20, 10, 5, 2, 1],
    coins: [1, 0.5, 0.25, 0.1, 0.05, 0.01],
  },
  {
    code: "GB",
    name: "United Kingdom (GBP)",
    symbol: "£",
    notes: [50, 20, 10, 5],
    coins: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  },
  {
    code: "EU",
    name: "Euro (EUR)",
    symbol: "€",
    notes: [500, 200, 100, 50, 20, 10, 5],
    coins: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  },
  {
    code: "JP",
    name: "Japan (JPY)",
    symbol: "¥",
    notes: [10000, 5000, 2000, 1000],
    coins: [500, 100, 50, 10, 5, 1],
  },
];

// DOM refs
const countrySelect = document.getElementById("countrySelect");
const denominationsEl = document.getElementById("denominations");
const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");
const resultArea = document.getElementById("resultArea");
const totalDisplay = document.getElementById("totalDisplay");
const breakdownDisplay = document.getElementById("breakdownDisplay");
const noteCountInfo = document.getElementById("noteCountInfo");
const segButtons = Array.from(document.querySelectorAll(".seg-btn"));

// Populate country select
COUNTRIES.forEach((c, idx) => {
  const opt = document.createElement("option");
  opt.value = idx;
  opt.textContent = c.name;
  countrySelect.appendChild(opt);
});
countrySelect.selectedIndex = 0;

// State
let currentMode = "both"; // 'notes' | 'coins' | 'both'

// Helper function to format currency
function formatAmount(num, country) {
  const noDecimalCurrencies = ["JP"];
  if (noDecimalCurrencies.includes(country.code)) {
    return `${country.symbol} ${Math.round(num).toLocaleString()}`;
  } else {
    return `${country.symbol} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

// Render denominations UI
function renderDenominations() {
  const country = COUNTRIES[countrySelect.value];
  denominationsEl.innerHTML = "";

  const showNotes = currentMode === "notes" || currentMode === "both";
  const showCoins = currentMode === "coins" || currentMode === "both";

  function makeRow(value, type, idx) {
    const row = document.createElement("div");
    row.className = "denom-row";
    const label = document.createElement("div");
    label.className = "denom-label";
    label.textContent = `${value} ${country.symbol}`;
    row.appendChild(label);

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = "0";
    input.setAttribute("aria-label", `${type} ${value} count`);
    input.dataset.denom = value;
    input.dataset.type = type;
    input.dataset.index = idx;
    input.addEventListener("input", () => {
      if (input.value === "" || Number(input.value) < 0) input.value = 0;
    });

    row.appendChild(input);

    return row;
  }

  if (showNotes) {
    country.notes.forEach((n, i) =>
      denominationsEl.appendChild(makeRow(n, "note", i))
    );
  }
  if (showCoins) {
    country.coins.forEach((cV, i) =>
      denominationsEl.appendChild(makeRow(cV, "coin", i))
    );
  }

  noteCountInfo.textContent = `${
    showNotes ? country.notes.length + " notes" : ""
  }${showNotes && showCoins ? " • " : ""}${
    showCoins ? country.coins.length + " coins" : ""
  }`;
}

// Event wiring
segButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    segButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    renderDenominations();
    resultArea.hidden = true;
  });
});

countrySelect.addEventListener("change", () => {
  renderDenominations();
  resultArea.hidden = true;
});

calcBtn.addEventListener("click", () => {
  const country = COUNTRIES[countrySelect.value];
  const inputs = Array.from(
    denominationsEl.querySelectorAll("input[type=number]")
  );
  const noDecimals = ["JP"];
  const factor = noDecimals.includes(country.code) ? 1 : 100;

  let totalSub = 0;
  const breakdown = [];

  inputs.forEach((inp) => {
    const cnt = Math.max(0, Math.floor(Number(inp.value || 0)));
    if (cnt === 0) return;
    const denom = Number(inp.dataset.denom);
    const denomSub = Math.round(denom * factor);
    const addSub = denomSub * cnt;
    totalSub += addSub;
    breakdown.push({
      type: inp.dataset.type,
      denom,
      cnt,
      subtotalSub: addSub,
    });
  });

  const totalBase = noDecimals.includes(country.code)
    ? totalSub
    : totalSub / 100;

  totalDisplay.textContent = `Total: ${formatAmount(totalBase, country)}`;

  if (breakdown.length === 0) {
    breakdownDisplay.innerHTML = `<div class="small">No items entered — Please fill in counts</div>`;
  } else {
    breakdown.sort((a, b) => b.denom - a.denom);
    const lines = breakdown.map((item) => {
      const subBase = noDecimals.includes(country.code)
        ? item.subtotalSub
        : item.subtotalSub / 100;
      return `${item.cnt} × ${item.denom} ${country.symbol} = ${formatAmount(
        subBase,
        country
      )}`;
    });
    breakdownDisplay.innerHTML = lines.join("<br>");
  }

  resultArea.hidden = false;
});

clearBtn.addEventListener("click", () => {
  const inputs = Array.from(
    denominationsEl.querySelectorAll("input[type=number]")
  );
  inputs.forEach((i) => (i.value = "0"));
  resultArea.hidden = true;
});

// Initial render
renderDenominations();
