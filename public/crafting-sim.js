function normalizePattern(pattern) {
  const rows = pattern.map((row) => row.slice());
  while (rows.length && rows[0].every((cell) => !cell)) rows.shift();
  while (rows.length && rows[rows.length - 1].every((cell) => !cell)) rows.pop();
  if (!rows.length) return [];

  let left = 0;
  let right = rows[0].length - 1;
  while (left <= right && rows.every((row) => !row[left])) left += 1;
  while (right >= left && rows.every((row) => !row[right])) right -= 1;
  return rows.map((row) => row.slice(left, right + 1));
}

function patternsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let y = 0; y < a.length; y += 1) {
    if (a[y].length !== b[y].length) return false;
    for (let x = 0; x < a[y].length; x += 1) {
      if ((a[y][x] || null) !== (b[y][x] || null)) return false;
    }
  }
  return true;
}

function initCraftingSimulator(section) {
  const data = JSON.parse(section.dataset.craftingSim || "{}");
  const gridEl = section.querySelector(".sim-grid");
  const paletteEl = section.querySelector(".sim-palette");
  const clearButton = section.querySelector(".sim-clear");
  const presetButtons = Array.from(section.querySelectorAll(".sim-preset"));
  const resultImage = section.querySelector(".sim-result-image");
  const resultName = section.querySelector(".sim-result-name");
  const resultText = section.querySelector(".sim-result-text");

  if (!gridEl || !paletteEl) return;

  const itemsById = Object.fromEntries(data.items.map((item) => [item.id, item]));
  const recipes = data.recipes.map((recipe) => ({
    ...recipe,
    normalizedPatterns: (recipe.patterns || [recipe.pattern]).map(normalizePattern)
  }));
  const recipesById = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]));

  const grid = Array.from({ length: 3 }, () => Array(3).fill(null));
  let selectedCell = 0;

  function renderGrid() {
    gridEl.innerHTML = "";
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        const index = y * 3 + x;
        const value = grid[y][x];
        const item = value ? itemsById[value] : null;
        const button = document.createElement("button");
        button.type = "button";
        button.className = `sim-slot ${selectedCell === index ? "active" : ""}`;
        button.dataset.index = String(index);
        button.dataset.slot = "true";
        button.innerHTML = item
          ? `<img class="mc-texture" src="${item.image}" alt="${item.name}" /><span>${item.name}</span>`
          : `<span class="sim-slot-placeholder">+</span>`;
        button.addEventListener("click", () => {
          selectedCell = index;
          renderGrid();
        });
        button.addEventListener("dragover", (event) => {
          event.preventDefault();
          button.classList.add("drag-over");
        });
        button.addEventListener("dragleave", () => {
          button.classList.remove("drag-over");
        });
        button.addEventListener("drop", (event) => {
          event.preventDefault();
          button.classList.remove("drag-over");
          const itemId = event.dataTransfer?.getData("text/plain");
          if (itemId === "__empty__") {
            setCell(null);
            return;
          }
          if (itemId && itemsById[itemId]) {
            selectedCell = index;
            setCell(itemId);
          }
        });
        gridEl.appendChild(button);
      }
    }
  }

  function updateResult() {
    const normalized = normalizePattern(grid);
    const recipe = recipes.find((entry) =>
      entry.normalizedPatterns.some((pattern) => patternsEqual(pattern, normalized))
    );

    if (!recipe) {
      resultImage.innerHTML = "";
      resultName.textContent = data.labels.empty;
      resultText.textContent = "";
      return;
    }

    resultImage.innerHTML = `<img class="mc-texture sim-result-icon" src="${recipe.resultImage}" alt="${recipe.name}" />`;
    resultName.textContent = recipe.name;
    resultText.textContent = recipe.resultText;
  }

  function setCell(itemId) {
    const y = Math.floor(selectedCell / 3);
    const x = selectedCell % 3;
    grid[y][x] = itemId;
    renderGrid();
    updateResult();
  }

  function renderPalette() {
    const emptyButton = document.createElement("button");
    emptyButton.type = "button";
    emptyButton.className = "sim-item";
    emptyButton.draggable = true;
    emptyButton.innerHTML = `<span class="sim-slot-placeholder">x</span><span>Empty</span>`;
    emptyButton.addEventListener("click", () => setCell(null));
    emptyButton.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", "__empty__");
    });
    paletteEl.appendChild(emptyButton);

    data.items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sim-item";
      button.draggable = true;
      button.innerHTML = `<img class="mc-texture" src="${item.image}" alt="${item.name}" /><span>${item.name}</span>`;
      button.addEventListener("click", () => setCell(item.id));
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/plain", item.id);
      });
      paletteEl.appendChild(button);
    });
  }

  clearButton?.addEventListener("click", () => {
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        grid[y][x] = null;
      }
    }
    renderGrid();
    updateResult();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const recipe = recipesById[button.dataset.presetId || ""];
      if (!recipe) return;
      const pattern = (recipe.patterns || [recipe.pattern])[0] || [];

      for (let y = 0; y < 3; y += 1) {
        for (let x = 0; x < 3; x += 1) {
          grid[y][x] = pattern[y]?.[x] || null;
        }
      }

      selectedCell = 0;
      renderGrid();
      updateResult();
    });
  });

  renderGrid();
  renderPalette();
  updateResult();
}

document.querySelectorAll("[data-crafting-sim]").forEach(initCraftingSimulator);

function initFurnaceSimulator(section) {
  const data = JSON.parse(section.dataset.furnaceSim || "{}");
  const paletteEl = section.querySelector(".furnace-palette");
  const clearButton = section.querySelector(".furnace-clear");
  const inputSlot = section.querySelector('[data-furnace-slot="input"]');
  const fuelSlot = section.querySelector('[data-furnace-slot="fuel"]');
  const resultImage = section.querySelector(".furnace-result-image");
  const resultName = section.querySelector(".furnace-result-name");
  const resultText = section.querySelector(".furnace-result-text");
  const fuelNote = section.querySelector(".furnace-fuel-note");
  const presetButtons = Array.from(section.querySelectorAll("[data-furnace-preset]"));
  if (!paletteEl || !inputSlot || !fuelSlot) return;

  const itemsById = Object.fromEntries(data.items.map((item) => [item.id, item]));
  const recipesById = Object.fromEntries(data.recipes.map((recipe) => [recipe.id, recipe]));
  const state = { input: null, fuel: null };

  function renderSlot(slotEl, itemId, slotType) {
    const item = itemId ? itemsById[itemId] : null;
    slotEl.innerHTML = item
      ? `<img class="mc-texture" src="${item.image}" alt="${item.name}" /><span>${item.name}</span>`
      : `<span class="sim-slot-placeholder">${slotType === "input" ? "+" : "🔥"}</span>`;
  }

  function updateResult() {
    const recipe = data.recipes.find(
      (entry) => entry.input === state.input && entry.fuels.includes(state.fuel)
    );

    if (!recipe) {
      resultImage.innerHTML = "";
      resultName.textContent = data.labels.empty;
      resultText.textContent = "";
      fuelNote.textContent = "";
      return;
    }

    resultImage.innerHTML = `<img class="mc-texture sim-result-icon" src="${recipe.resultImage}" alt="${recipe.name}" />`;
    resultName.textContent = recipe.name;
    resultText.textContent = recipe.resultText;
    fuelNote.textContent = recipe.fuelNote;
  }

  function setSlot(slotType, itemId) {
    state[slotType] = itemId;
    renderSlot(inputSlot, state.input, "input");
    renderSlot(fuelSlot, state.fuel, "fuel");
    updateResult();
  }

  function wireDrop(slotEl, slotType) {
    slotEl.addEventListener("dragover", (event) => {
      event.preventDefault();
      slotEl.classList.add("drag-over");
    });
    slotEl.addEventListener("dragleave", () => slotEl.classList.remove("drag-over"));
    slotEl.addEventListener("drop", (event) => {
      event.preventDefault();
      slotEl.classList.remove("drag-over");
      const itemId = event.dataTransfer?.getData("text/plain");
      if (itemId === "__empty__") {
        setSlot(slotType, null);
        return;
      }
      const item = itemsById[itemId || ""];
      if (item && item.slot === slotType) {
        setSlot(slotType, item.id);
      }
    });
  }

  function renderPalette() {
    const emptyButton = document.createElement("button");
    emptyButton.type = "button";
    emptyButton.className = "sim-item";
    emptyButton.draggable = true;
    emptyButton.innerHTML = `<span class="sim-slot-placeholder">x</span><span>Empty</span>`;
    emptyButton.addEventListener("dragstart", (event) => event.dataTransfer?.setData("text/plain", "__empty__"));
    paletteEl.appendChild(emptyButton);

    data.items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sim-item";
      button.draggable = true;
      button.innerHTML = `<img class="mc-texture" src="${item.image}" alt="${item.name}" /><span>${item.name}</span>`;
      button.addEventListener("dragstart", (event) => event.dataTransfer?.setData("text/plain", item.id));
      button.addEventListener("click", () => {
        if (item.slot === "input") setSlot("input", item.id);
        if (item.slot === "fuel") setSlot("fuel", item.id);
      });
      paletteEl.appendChild(button);
    });
  }

  clearButton?.addEventListener("click", () => {
    setSlot("input", null);
    setSlot("fuel", null);
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const recipe = recipesById[button.dataset.furnacePreset || ""];
      if (!recipe) return;
      setSlot("input", recipe.input);
      setSlot("fuel", recipe.fuels[0]);
    });
  });

  wireDrop(inputSlot, "input");
  wireDrop(fuelSlot, "fuel");
  renderPalette();
  renderSlot(inputSlot, null, "input");
  renderSlot(fuelSlot, null, "fuel");
  updateResult();
}

document.querySelectorAll("[data-furnace-sim]").forEach(initFurnaceSimulator);
