(function () {
  const state = {
    typeId: 'acrylique',
    simulateSelection: [], // [{ pigment, parts }]
  };

  const el = (id) => document.getElementById(id);

  const paintTypeRow = el('paint-type-row');
  const paintTypeTip = el('paint-type-tip');
  const tabFind = el('tab-find');
  const tabSimulate = el('tab-simulate');
  const panelFind = el('panel-find');
  const panelSimulate = el('panel-simulate');

  const targetColorInput = el('target-color');
  const targetHexInput = el('target-hex');
  const presetRow = el('preset-row');
  const swatchTarget = el('swatch-target');
  const swatchResult = el('swatch-result');
  const precisionText = el('precision-text');
  const partsList = el('parts-list');
  const copyFindBtn = el('copy-find');

  const pigmentRow = el('pigment-row');
  const partsEditorCard = el('parts-editor-card');
  const partsEditor = el('parts-editor');
  const simulateResultCard = el('simulate-result-card');
  const simulateEmpty = el('simulate-empty');
  const swatchSimulate = el('swatch-simulate');
  const simulateName = el('simulate-name');
  const simulateHex = el('simulate-hex');
  const simulateBreakdown = el('simulate-breakdown');
  const copySimulateBtn = el('copy-simulate');

  // --- Type de peinture -----------------------------------------------

  function renderPaintTypes() {
    paintTypeRow.innerHTML = '';
    PAINT_TYPES.forEach((type) => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = type.label;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(type.id === state.typeId));
      btn.addEventListener('click', () => {
        state.typeId = type.id;
        state.simulateSelection = [];
        renderPaintTypes();
        renderPigmentChips();
        renderPartsEditor();
        computeFind();
        updatePaintTypeTip();
      });
      paintTypeRow.appendChild(btn);
    });
  }

  function updatePaintTypeTip() {
    const type = PAINT_TYPES.find((t) => t.id === state.typeId);
    paintTypeTip.textContent = type ? type.tip : '';
  }

  // --- Tabs --------------------------------------------------------------

  function selectTab(name) {
    const isFind = name === 'find';
    tabFind.setAttribute('aria-selected', String(isFind));
    tabSimulate.setAttribute('aria-selected', String(!isFind));
    panelFind.hidden = !isFind;
    panelSimulate.hidden = isFind;
  }
  tabFind.addEventListener('click', () => selectTab('find'));
  tabSimulate.addEventListener('click', () => selectTab('simulate'));

  // --- Mode "Trouver un mélange" -----------------------------------------

  function renderPresets() {
    presetRow.innerHTML = '';
    TARGET_PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.innerHTML = `<span class="dot" style="background:${preset.hex}"></span>${preset.name}`;
      btn.addEventListener('click', () => {
        targetColorInput.value = preset.hex;
        targetHexInput.value = preset.hex;
        computeFind();
      });
      presetRow.appendChild(btn);
    });
  }

  function isValidHex(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(hex);
  }

  targetColorInput.addEventListener('input', () => {
    targetHexInput.value = targetColorInput.value;
    computeFind();
  });

  targetHexInput.addEventListener('input', () => {
    const val = targetHexInput.value.trim();
    if (isValidHex(val)) {
      targetColorInput.value = val;
      computeFind();
    }
  });

  function computeFind() {
    const hex = isValidHex(targetHexInput.value) ? targetHexInput.value : targetColorInput.value;
    const pigments = pigmentsForType(state.typeId);
    const result = findBestMix(hex, pigments);

    swatchTarget.style.background = hex;
    swatchResult.style.background = result.resultHex;
    precisionText.textContent = `Correspondance ≈ ${result.precision}%`;

    partsList.innerHTML = '';
    result.parts
      .slice()
      .sort((a, b) => b.percent - a.percent)
      .forEach((part) => {
        const li = document.createElement('li');
        const barColor = rgb01ToHex(rybToRgb(...part.pigment.ryb));
        li.innerHTML = `
          <span class="dot" style="background:${barColor}"></span>
          <span class="part-info">
            <span class="part-name">${part.pigment.name}</span>
            <span class="part-ratio">${part.ratio ? `${part.ratio} part${part.ratio > 1 ? 's' : ''}` : ''}</span>
            <span class="bar-track"><span class="bar-fill" style="width:${part.percent}%;background:${barColor}"></span></span>
          </span>
          <span class="part-percent">${part.percent}%</span>
        `;
        partsList.appendChild(li);
      });

    copyFindBtn.dataset.hex = result.resultHex;
  }

  copyFindBtn.addEventListener('click', () => copyToClipboard(copyFindBtn.dataset.hex, copyFindBtn));

  // --- Mode "Simuler un mélange" ------------------------------------------

  function pigmentHex(pigment) {
    return rgb01ToHex(rybToRgb(...pigment.ryb));
  }

  function renderPigmentChips() {
    pigmentRow.innerHTML = '';
    pigmentsForType(state.typeId).forEach((pigment) => {
      const selected = state.simulateSelection.some((s) => s.pigment.id === pigment.id);
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.setAttribute('aria-pressed', String(selected));
      btn.innerHTML = `<span class="dot" style="background:${pigmentHex(pigment)}"></span>${pigment.name}`;
      btn.addEventListener('click', () => toggleSimulatePigment(pigment));
      pigmentRow.appendChild(btn);
    });
  }

  function toggleSimulatePigment(pigment) {
    const idx = state.simulateSelection.findIndex((s) => s.pigment.id === pigment.id);
    if (idx >= 0) {
      state.simulateSelection.splice(idx, 1);
    } else {
      if (state.simulateSelection.length >= 3) return;
      state.simulateSelection.push({ pigment, parts: 1 });
    }
    renderPigmentChips();
    renderPartsEditor();
  }

  function renderPartsEditor() {
    const hasSelection = state.simulateSelection.length > 0;
    partsEditorCard.hidden = !hasSelection;
    simulateResultCard.hidden = !hasSelection;
    simulateEmpty.hidden = hasSelection;

    partsEditor.innerHTML = '';
    state.simulateSelection.forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="dot" style="background:${pigmentHex(entry.pigment)}"></span>
        <span class="part-name">${entry.pigment.name}</span>
        <span class="stepper">
          <button type="button" data-action="dec" aria-label="Moins de parts">−</button>
          <output>${entry.parts}</output>
          <button type="button" data-action="inc" aria-label="Plus de parts">+</button>
        </span>
      `;
      li.querySelector('[data-action="dec"]').addEventListener('click', () => {
        entry.parts = Math.max(1, entry.parts - 1);
        renderPartsEditor();
      });
      li.querySelector('[data-action="inc"]').addEventListener('click', () => {
        entry.parts = Math.min(9, entry.parts + 1);
        renderPartsEditor();
      });
      partsEditor.appendChild(li);
    });

    computeSimulate();
  }

  function computeSimulate() {
    if (state.simulateSelection.length === 0) return;
    const pigments = state.simulateSelection.map((s) => s.pigment);
    const weights = state.simulateSelection.map((s) => s.parts);
    const rgb01 = mixPigments(pigments, weights);
    const hex = rgb01ToHex(rgb01);
    const rgb255 = rgb01.map((v) => v * 255);

    swatchSimulate.style.background = hex;
    simulateName.textContent = nameColor(rgb255);
    simulateHex.textContent = hex;

    const total = weights.reduce((a, b) => a + b, 0);
    simulateBreakdown.textContent = state.simulateSelection
      .map((s) => `${Math.round((s.parts / total) * 100)}% ${s.pigment.name}`)
      .join(' • ');

    copySimulateBtn.dataset.hex = hex;
  }

  copySimulateBtn.addEventListener('click', () => copyToClipboard(copySimulateBtn.dataset.hex, copySimulateBtn));

  // --- Utilitaires ---------------------------------------------------------

  function copyToClipboard(text, button) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      const original = button.textContent;
      button.textContent = 'Copié ✓';
      setTimeout(() => { button.textContent = original; }, 1200);
    });
  }

  // --- Initialisation --------------------------------------------------------

  renderPaintTypes();
  updatePaintTypeTip();
  renderPresets();
  renderPigmentChips();
  computeFind();
})();
