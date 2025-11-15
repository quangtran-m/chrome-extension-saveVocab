// ========== UI ========== //
const toolbar = document.createElement("div");
toolbar.style.position = "fixed";
toolbar.style.bottom = "10px";
toolbar.style.left = "10px";
toolbar.style.zIndex = "999999";
toolbar.style.background = "rgba(255, 255, 255, 0.9)";
toolbar.style.border = "1px solid #ccc";
toolbar.style.borderRadius = "8px";
toolbar.style.padding = "6px 10px";
toolbar.style.display = "flex";
toolbar.style.gap = "8px";
toolbar.style.fontFamily = "sans-serif";

const exportBtn = document.createElement("button");
exportBtn.textContent = "Export";
exportBtn.style.cursor = "pointer";

const importBtn = document.createElement("button");
importBtn.textContent = "Import";
importBtn.style.cursor = "pointer";

// Add Firebase Sync button
const syncBtn = document.createElement("button");
syncBtn.id = "syncButton";
syncBtn.textContent = "☁️ Sync Off";
syncBtn.style.cursor = "pointer";
syncBtn.style.background = "#757575";
syncBtn.style.color = "white";
syncBtn.style.border = "none";
syncBtn.style.borderRadius = "4px";
syncBtn.style.padding = "4px 8px";
syncBtn.style.fontSize = "11px";

// Add sync controls container
const syncControls = document.createElement("div");
syncControls.style.display = "none";
syncControls.style.position = "absolute";
syncControls.style.bottom = "40px";
syncControls.style.left = "0";
syncControls.style.background = "white";
syncControls.style.border = "1px solid #ccc";
syncControls.style.borderRadius = "4px";
syncControls.style.padding = "8px";
syncControls.style.minWidth = "150px";
syncControls.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

const enableSyncBtn = document.createElement("button");
enableSyncBtn.textContent = "Bật đồng bộ";
enableSyncBtn.style.cssText = "width: 100%; margin-bottom: 4px; padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; background: #4CAF50; color: white; border-radius: 3px;";

const disableSyncBtn = document.createElement("button");
disableSyncBtn.textContent = "Tắt đồng bộ";
disableSyncBtn.style.cssText = "width: 100%; margin-bottom: 4px; padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; background: #f44336; color: white; border-radius: 3px;";

const forceSyncBtn = document.createElement("button");
forceSyncBtn.textContent = "Đồng bộ ngay";
forceSyncBtn.style.cssText = "width: 100%; padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; background: #2196F3; color: white; border-radius: 3px;";

syncControls.appendChild(enableSyncBtn);
syncControls.appendChild(disableSyncBtn);
syncControls.appendChild(forceSyncBtn);

toolbar.appendChild(exportBtn);
toolbar.appendChild(importBtn);
toolbar.appendChild(syncBtn);
toolbar.appendChild(syncControls);
document.body.appendChild(toolbar);

// ========== Highlight Logic ========== //
async function highlightAll() {
  const { words = [] } = await chrome.storage.local.get("words");
  if (!words.length) return;

  // Remove existing highlights first
  document.querySelectorAll(".jp-highlight").forEach(el => {
    el.replaceWith(document.createTextNode(el.textContent));
  });

  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  walkAndHighlight(document.body, regex);
}

function walkAndHighlight(node, regex) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.parentElement?.closest("script,style,textarea")) return;
    const text = node.nodeValue;
    if (!text.trim()) return;
    if (regex.test(text)) {
      const span = document.createElement("span");
      span.innerHTML = text.replace(regex, '<span class="jp-highlight" style="background: yellow;">$1</span>');
      node.replaceWith(span);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    [...node.childNodes].forEach(child => walkAndHighlight(child, regex));
  }
}

// Make highlightAll available globally for Firebase sync
window.highlightAll = highlightAll;

highlightAll();

// ========== Triple H Click Detection ========== //
let hClickCount = 0;
let hClickTimer = null;
let removeButton = null;

function createRemoveButton() {
  const button = document.createElement("button");
  button.textContent = "🗑️ Remove";
  button.style.cssText = `
    position: fixed;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    z-index: 1000000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    font-family: sans-serif;
    white-space: nowrap;
  `;
  button.addEventListener('mouseenter', () => {
    button.style.background = '#da190b';
  });
  button.addEventListener('mouseleave', () => {
    button.style.background = '#f44336';
  });
  return button;
}

function showRemoveButton(x, y, highlightedText, highlightElement) {
  hideRemoveButton();
  
  removeButton = createRemoveButton();
  removeButton.style.left = Math.max(10, Math.min(x, window.innerWidth - 120)) + 'px';
  removeButton.style.top = Math.max(10, y - 45) + 'px';
  
  removeButton.onclick = async () => {
    const { words = [] } = await chrome.storage.local.get("words");
    const newList = words.filter(w => w !== highlightedText);
    await chrome.storage.local.set({ words: newList });
    removeHighlight(highlightedText);
    hideRemoveButton();
    
    // Sync to Firebase if enabled
    if (window.firebaseSync && window.firebaseSync.syncEnabled) {
      await window.firebaseSync.uploadToFirebase();
    }
  };
  
  document.body.appendChild(removeButton);
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    hideRemoveButton();
  }, 3000);
}

function hideRemoveButton() {
  if (removeButton) {
    removeButton.remove();
    removeButton = null;
  }
}

// ========== Hotkeys ========== //
document.addEventListener("keydown", async (e) => {
  // Triple H click detection
  if (e.key.toLowerCase() === 'h') {
    hClickCount++;
    
    if (hClickTimer) {
      clearTimeout(hClickTimer);
    }
    
    if (hClickCount === 3) {
      // Triple H detected - highlight selection
      const selection = window.getSelection().toString().trim();
      if (selection) {
        const { words = [] } = await chrome.storage.local.get("words");
        if (!words.includes(selection)) {
          words.push(selection);
          await chrome.storage.local.set({ words });
          highlightAll();
          
          // Sync to Firebase if enabled
          if (window.firebaseSync && window.firebaseSync.syncEnabled) {
            await window.firebaseSync.uploadToFirebase();
          }
        }
        window.getSelection().removeAllRanges();
      }
      hClickCount = 0;
    } else {
      // Reset counter after 1 second
      hClickTimer = setTimeout(() => {
        hClickCount = 0;
      }, 1000);
    }
  } else {
    // Reset H counter if other key is pressed
    hClickCount = 0;
    if (hClickTimer) {
      clearTimeout(hClickTimer);
    }
  }

  if (e.ctrlKey && e.key === "Enter") {
    const selection = window.getSelection().toString().trim();
    if (!selection) return;
    const { words = [] } = await chrome.storage.local.get("words");
    if (!words.includes(selection)) {
      words.push(selection);
      await chrome.storage.local.set({ words });
      highlightAll();
      
      // Sync to Firebase if enabled
      if (window.firebaseSync && window.firebaseSync.syncEnabled) {
        await window.firebaseSync.uploadToFirebase();
      }
    }
  }

  if (e.ctrlKey && e.key === "Backspace") {
    const selection = window.getSelection().toString().trim();
    if (!selection) return;
    const { words = [] } = await chrome.storage.local.get("words");
    const newList = words.filter(w => w !== selection);
    await chrome.storage.local.set({ words: newList });
    removeHighlight(selection);
    
    // Sync to Firebase if enabled
    if (window.firebaseSync && window.firebaseSync.syncEnabled) {
      await window.firebaseSync.uploadToFirebase();
    }
  }
});

// ========== Click on Highlighted Text ========== //
document.addEventListener('click', async (e) => {
  // Hide remove button if clicking outside
  if (e.target !== removeButton && !removeButton?.contains(e.target)) {
    hideRemoveButton();
  }
  
  if (e.target.classList.contains('jp-highlight')) {
    const highlightedText = e.target.textContent.trim();
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(highlightedText);
      console.log('Copied to clipboard:', highlightedText);
      
      // Show visual feedback
      const originalBg = e.target.style.background;
      e.target.style.background = '#90EE90'; // Light green
      setTimeout(() => {
        e.target.style.background = originalBg;
      }, 300);
      
    } catch (err) {
      console.log('Clipboard copy failed, using fallback');
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = highlightedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    // Show remove button at mouse cursor position
    const x = e.clientX - 60; // Center button horizontally around cursor
    const y = e.clientY + window.scrollY - 50; // Position above cursor
    
    showRemoveButton(x, y, highlightedText, e.target);
  }
});

// ========== Remove Highlight ========== //
function removeHighlight(word) {
  document.querySelectorAll(".jp-highlight").forEach(el => {
    if (el.textContent.trim() === word) {
      el.replaceWith(document.createTextNode(el.textContent));
    }
  });
}



// ========== Export / Import ========== //
exportBtn.onclick = async () => {
  const { words = [] } = await chrome.storage.local.get("words");
  const blob = new Blob([words.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jp_vocab.txt";
  a.click();
  URL.revokeObjectURL(url);
};

importBtn.onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const imported = text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
    const { words = [] } = await chrome.storage.local.get("words");
    const merged = Array.from(new Set([...words, ...imported]));
    await chrome.storage.local.set({ words: merged });
    highlightAll();
    
    // Sync to Firebase if enabled
    if (window.firebaseSync && window.firebaseSync.syncEnabled) {
      await window.firebaseSync.uploadToFirebase();
    }
  };
  input.click();
};

// ========== Firebase Sync UI Handlers ========== //
// Toggle sync controls visibility
syncBtn.onclick = (e) => {
  e.stopPropagation();
  syncControls.style.display = syncControls.style.display === 'none' ? 'block' : 'none';
};

// Hide sync controls when clicking outside
document.addEventListener('click', (e) => {
  if (!toolbar.contains(e.target)) {
    syncControls.style.display = 'none';
  }
});

// Sync control handlers
enableSyncBtn.onclick = async () => {
  if (window.firebaseSync) {
    const success = await window.firebaseSync.toggleSync(true);
    if (success) {
      syncControls.style.display = 'none';
    }
  }
};

disableSyncBtn.onclick = async () => {
  if (window.firebaseSync) {
    await window.firebaseSync.toggleSync(false);
    syncControls.style.display = 'none';
  }
};

forceSyncBtn.onclick = async () => {
  if (window.firebaseSync) {
    await window.firebaseSync.forceSync();
    syncControls.style.display = 'none';
  }
};
