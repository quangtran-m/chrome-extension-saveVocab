// ========== UI ========== //
console.log("🔧 Initializing JP Vocab Highlighter UI...");

// Debug function - Make toolbar manually visible
function forceShowToolbar() {
  console.log("🚨 Force showing main toolbar...");
  
  const mainToolbar = document.getElementById("jp-vocab-toolbar");
  if (mainToolbar) {
    // Reset main toolbar styles to ensure visibility
    mainToolbar.style.cssText = `
      position: fixed !important;
      bottom: 10px !important;
      left: 10px !important;
      z-index: 999999 !important;
      background: rgba(255, 255, 255, 0.95) !important;
      border: 2px solid #4CAF50 !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      display: flex !important;
      gap: 8px !important;
      font-family: sans-serif !important;
      align-items: center !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      min-width: 120px !important;
      min-height: 35px !important;
    `;
    console.log("✅ Main toolbar forced visible");
    return;
  }
  
  // If main toolbar doesn't exist, create debug alternative
  console.log("⚠️ Main toolbar not found, creating debug version...");
  
  const debugToolbar = document.createElement("div");
  debugToolbar.id = "jp-vocab-debug-toolbar";
  debugToolbar.innerHTML = `
    <button onclick="if(window.firebaseSync) window.firebaseSync.showSyncInfo()" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
      🔄 Status
    </button>
    <button onclick="alert('Debug: Menu would open here')" style="padding: 8px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 4px;">
      ⚙️ Debug Menu
    </button>
  `;
  
  debugToolbar.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    background: rgba(255, 0, 0, 0.9) !important;
    border: 2px solid yellow !important;
    border-radius: 8px !important;
    padding: 10px !important;
    display: flex !important;
    gap: 8px !important;
    font-family: Arial !important;
  `;
  
  document.body.appendChild(debugToolbar);
  console.log("✅ Debug toolbar created");
}

// Make debug function available globally
window.forceShowToolbar = forceShowToolbar;

const toolbar = document.createElement("div");
toolbar.id = "jp-vocab-toolbar"; // Add ID for easier debugging
toolbar.style.cssText = `
  position: fixed !important;
  bottom: 10px !important;
  left: 10px !important;
  z-index: 999999 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  display: flex !important;
  gap: 8px !important;
  font-family: sans-serif !important;
  align-items: center !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
  min-width: 120px !important;
  min-height: 35px !important;
`;

console.log("✅ Toolbar created");

// Main sync status button
const syncStatusBtn = document.createElement("button");
syncStatusBtn.id = "syncStatusButton";
syncStatusBtn.textContent = "🔄 Sync";
syncStatusBtn.style.cursor = "pointer";
syncStatusBtn.style.background = "#FF9800";
syncStatusBtn.style.color = "white";
syncStatusBtn.style.border = "none";
syncStatusBtn.style.borderRadius = "4px";
syncStatusBtn.style.padding = "6px 12px";
syncStatusBtn.style.fontSize = "12px";
syncStatusBtn.style.fontWeight = "bold";

// Menu toggle button
const menuBtn = document.createElement("button");
menuBtn.textContent = "⚙️";
menuBtn.style.cssText = `
  cursor: pointer;
  background: #607D8B;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  fontSize: 12px;
  margin-left: 4px;
`;

// Dropdown menu container
const dropdownMenu = document.createElement("div");
dropdownMenu.id = "syncDropdownMenu";
dropdownMenu.style.cssText = `
  display: none;
  position: absolute;
  bottom: 45px;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000000;
`;

// Menu items
const menuItems = [
  { id: 'simpleLoginButton', text: '🔐 Đăng nhập Email', color: '#4CAF50', authState: 'logged-out' },
  { id: 'simpleLogoutButton', text: '👤 User', color: '#34A853', authState: 'logged-in' },
  { id: 'uploadButton', text: '⬆️ Upload to Firebase', color: '#2196F3' },
  { id: 'downloadButton', text: '⬇️ Download from Firebase', color: '#2196F3' },
  { id: 'exportButton', text: '📄 Export file', color: '#FF9800' },
  { id: 'importButton', text: '📁 Import file', color: '#9C27B0' }
];

menuItems.forEach((item, index) => {
  const menuItem = document.createElement("button");
  menuItem.id = item.id;
  menuItem.textContent = item.text;
  menuItem.style.cssText = `
    width: 100%;
    margin-bottom: ${index < menuItems.length - 1 ? '6px' : '0'};
    padding: 8px 12px;
    cursor: pointer;
    border: 1px solid #ddd;
    background: ${item.color};
    color: white;
    border-radius: 4px;
    font-size: 12px;
    text-align: left;
    transition: opacity 0.2s;
  `;
  
  // Set initial visibility based on auth state
  if (item.authState === 'logged-out') {
    menuItem.style.display = 'block'; // Initially show login button
  } else if (item.authState === 'logged-in') {
    menuItem.style.display = 'none'; // Initially hide logout button
  }
  
  // Hover effects
  menuItem.addEventListener('mouseenter', () => {
    menuItem.style.opacity = '0.8';
  });
  menuItem.addEventListener('mouseleave', () => {
    menuItem.style.opacity = '1';
  });
  
  dropdownMenu.appendChild(menuItem);
});

// Assemble toolbar
toolbar.appendChild(syncStatusBtn);
toolbar.appendChild(menuBtn);
toolbar.appendChild(dropdownMenu);

console.log("✅ Toolbar assembled with", toolbar.children.length, "children");

// Wait for DOM to be ready before appending
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(toolbar);
    console.log("✅ Toolbar added to DOM (after DOMContentLoaded)");
  });
} else {
  document.body.appendChild(toolbar);
  console.log("✅ Toolbar added to DOM (immediately)");
}

// Verify toolbar is visible
setTimeout(() => {
  const toolbarInDOM = document.body.contains(toolbar);
  const toolbarVisible = toolbar.offsetParent !== null;
  console.log("🔍 Toolbar verification:", {
    inDOM: toolbarInDOM,
    visible: toolbarVisible,
    position: toolbar.style.position,
    zIndex: toolbar.style.zIndex
  });
  
  // If toolbar not visible, show debug toolbar
  if (!toolbarVisible) {
    console.warn("⚠️ Main toolbar not visible, showing debug toolbar");
    forceShowToolbar();
  }
}, 1000);

// Global debug commands
console.log("🎯 Debug commands available:");
console.log("  - forceShowToolbar() : Force show debug toolbar");
console.log("  - document.getElementById('jp-vocab-toolbar') : Check main toolbar");

// Test highlighting immediately
console.log("🎨 Testing highlight function...");
setTimeout(() => {
  if (window.highlightAll) {
    highlightAll();
    console.log("✅ Highlight function tested");
  } else {
    console.warn("⚠️ highlightAll function not available");
  }
}, 500);

// Menu toggle functionality
menuBtn.onclick = (e) => {
  e.stopPropagation();
  const isVisible = dropdownMenu.style.display !== 'none';
  dropdownMenu.style.display = isVisible ? 'none' : 'block';
};

// Hide menu when clicking outside
document.addEventListener('click', (e) => {
  if (!toolbar.contains(e.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// Close menu after clicking any menu item
dropdownMenu.addEventListener('click', () => {
  setTimeout(() => {
    dropdownMenu.style.display = 'none';
  }, 100);
});

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
// Selected word tracking for deletion
let selectedWordElement = null;
let selectedWordText = null;

function selectWordForDeletion(highlightElement, highlightedText) {
  // Clear previous selection
  clearSelectedWord();
  
  // Set new selection
  selectedWordElement = highlightElement;
  selectedWordText = highlightedText;
  
  // Add visual indicator
  highlightElement.style.outline = '2px solid #ff4444';
  highlightElement.style.outlineOffset = '2px';
  
  console.log('🎯 Word selected for deletion (use Ctrl+Backspace):', highlightedText);
  
  // Auto-clear selection after 10 seconds
  setTimeout(() => {
    if (selectedWordElement === highlightElement) {
      clearSelectedWord();
    }
  }, 10000);
}

function clearSelectedWord() {
  if (selectedWordElement) {
    selectedWordElement.style.outline = '';
    selectedWordElement.style.outlineOffset = '';
    selectedWordElement = null;
    selectedWordText = null;
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
          
          // Always auto-sync to Firebase
          if (window.firebaseSync) {
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
      
      // Always auto-sync to Firebase
      if (window.firebaseSync) {
        await window.firebaseSync.uploadToFirebase();
      }
    }
  }

  if (e.ctrlKey && e.key === "Backspace") {
    // Check if we have a selected word (with red outline)
    if (selectedWordText && selectedWordElement) {
      const { words = [] } = await chrome.storage.local.get("words");
      const newList = words.filter(w => w !== selectedWordText);
      await chrome.storage.local.set({ words: newList });
      removeHighlight(selectedWordText);
      
      // Always auto-sync to Firebase
      if (window.firebaseSync) {
        await window.firebaseSync.uploadToFirebase();
      }
      
      // Clear selection after deletion
      clearSelectedWord();
      console.log('🗑️ Word deleted via Ctrl+Backspace:', selectedWordText);
      return;
    }
    
    // Fallback to selected text if no word is selected
    const selection = window.getSelection().toString().trim();
    if (!selection) return;
    const { words = [] } = await chrome.storage.local.get("words");
    const newList = words.filter(w => w !== selection);
    await chrome.storage.local.set({ words: newList });
    removeHighlight(selection);
    
    // Always auto-sync to Firebase
    if (window.firebaseSync) {
      await window.firebaseSync.uploadToFirebase();
    }
  }
});

// ========== Click on Highlighted Text ========== //
document.addEventListener('click', async (e) => {
  // Clear selected word if clicking outside highlighted text
  if (!e.target.classList.contains('jp-highlight')) {
    clearSelectedWord();
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
    
    // Select word for deletion with red outline
    selectWordForDeletion(e.target, highlightedText);
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
// Use setTimeout to ensure buttons are created first
setTimeout(() => {
  const exportButton = document.getElementById('exportButton');
  if (exportButton) {
    exportButton.onclick = async () => {
      exportButton.disabled = true;
      exportButton.textContent = "⏳ Exporting...";
      
      const { words = [] } = await chrome.storage.local.get("words");
      const blob = new Blob([words.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jp_vocab.txt";
      a.click();
      URL.revokeObjectURL(url);
      
      exportButton.disabled = false;
      exportButton.textContent = "📄 Export file";
    };
    console.log("✅ Export button handler attached");
  } else {
    console.warn("⚠️ Export button not found");
  }

  const importButton = document.getElementById('importButton');
  if (importButton) {
    importButton.onclick = () => {
      importButton.disabled = true;
      importButton.textContent = "⏳ Importing...";
      
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          importButton.disabled = false;
          importButton.textContent = "📁 Import file";
          return;
        }
        
        const text = await file.text();
        const imported = text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
        const { words = [] } = await chrome.storage.local.get("words");
        const merged = Array.from(new Set([...words, ...imported]));
        await chrome.storage.local.set({ words: merged });
        highlightAll();
        
        // Auto-sync to Firebase
        if (window.firebaseSync) {
          await window.firebaseSync.uploadToFirebase();
        }
        
        importButton.disabled = false;
        importButton.textContent = "📁 Import file";
      };
      input.click();
    };
    console.log("✅ Import button handler attached");
  } else {
    console.warn("⚠️ Import button not found");
  }
}, 500); // Wait 500ms for buttons to be created

// ========== Firebase Sync UI Handlers ========== //
// Use setTimeout to ensure buttons are created first  
setTimeout(() => {
  // Upload local words to Firebase
  const uploadButton = document.getElementById('uploadButton');
  if (uploadButton) {
    uploadButton.onclick = async () => {
      uploadButton.disabled = true;
      uploadButton.textContent = "⏳ Uploading...";
      
      if (window.firebaseSync) {
        await window.firebaseSync.uploadToFirebase();
      }
      
      uploadButton.disabled = false;
      uploadButton.textContent = "⬆️ Upload to Firebase";
    };
    console.log("✅ Upload button handler attached");
  } else {
    console.warn("⚠️ Upload button not found");
  }

  // Download words from Firebase to local
  const downloadButton = document.getElementById('downloadButton');
  if (downloadButton) {
    downloadButton.onclick = async () => {
      downloadButton.disabled = true;
      downloadButton.textContent = "⏳ Downloading...";
      
      if (window.firebaseSync) {
        await window.firebaseSync.downloadFromFirebase();
      }
      
      downloadButton.disabled = false;
      downloadButton.textContent = "⬇️ Download from Firebase";
    };
    console.log("✅ Download button handler attached");
  } else {
    console.warn("⚠️ Download button not found");
  }

  // Simple Login button event handler
  const simpleLoginButton = document.getElementById('simpleLoginButton');
  if (simpleLoginButton) {
    simpleLoginButton.onclick = async () => {
      try {
        if (window.simpleAuth) {
          await window.simpleAuth.showLoginPrompt();
        }
      } catch (error) {
        console.error('❌ Simple login failed:', error);
      }
    };
    console.log("✅ Simple Login button handler attached");
  } else {
    console.warn("⚠️ Simple Login button not found");
  }

  // Simple Logout/Change Email button event handler
  const simpleLogoutButton = document.getElementById('simpleLogoutButton');
  if (simpleLogoutButton) {
    simpleLogoutButton.onclick = async () => {
      if (!window.simpleAuth) return;
      
      // Show action menu
      const actions = await window.simpleAuth.showUserMenu();
      // User menu will handle the actions
    };
    console.log("✅ Simple Logout button handler attached");
  } else {
    console.warn("⚠️ Simple Logout button not found");
  }
  
}, 500); // Wait 500ms for buttons to be created

// Show sync status and enable auto-sync
syncStatusBtn.onclick = async () => {
  if (window.firebaseSync) {
    await window.firebaseSync.showSyncInfo();
  }
};

// ========== Extension Load Verification ========== //
console.log("🎉 JP Vocab Highlighter extension loaded!");
console.log("📊 Extension status:", {
  toolbarCreated: !!document.getElementById('jp-vocab-toolbar'),
  highlightFunction: typeof window.highlightAll,
  firebaseSync: typeof window.firebaseSync
});

// Toolbar watchdog - monitor toolbar visibility
let toolbarWatchdog = null;
let lastToolbarRestored = 0;

function startToolbarWatchdog() {
  if (toolbarWatchdog) clearInterval(toolbarWatchdog);
  
  toolbarWatchdog = setInterval(() => {
    const toolbar = document.getElementById('jp-vocab-toolbar');
    
    if (!toolbar) {
      console.warn("🚨 Toolbar missing from DOM! This shouldn't happen.");
      return;
    }
    
    // Check if toolbar is actually hidden (not just CSS visibility)
    const computedStyle = window.getComputedStyle(toolbar);
    const isHidden = computedStyle.display === 'none' || 
                    computedStyle.visibility === 'hidden' || 
                    computedStyle.opacity === '0' ||
                    toolbar.offsetParent === null;
    
    // Only restore if truly hidden and not recently restored
    const now = Date.now();
    if (isHidden && (now - lastToolbarRestored > 5000)) {
      console.warn("⚠️ Toolbar actually hidden, restoring...");
      
      // Force restore toolbar visibility
      toolbar.style.cssText = `
        position: fixed !important;
        bottom: 10px !important;
        left: 10px !important;
        z-index: 999999 !important;
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid #ccc !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
        display: flex !important;
        gap: 8px !important;
        font-family: sans-serif !important;
        align-items: center !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        min-width: 120px !important;
        min-height: 35px !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      lastToolbarRestored = now;
      console.log("✅ Toolbar restored");
    }
  }, 5000); // Check every 5 seconds (less frequent)
}

// Start watchdog (disabled by default - enable with: window.enableToolbarWatchdog = true)
if (window.enableToolbarWatchdog) {
  startToolbarWatchdog();
  console.log("🔍 Toolbar watchdog started");
} else {
  console.log("🔍 Toolbar watchdog disabled (enable with: window.enableToolbarWatchdog = true)");
}

// Global function to check toolbar
window.checkToolbar = () => {
  const toolbar = document.getElementById('jp-vocab-toolbar');
  console.log("🔍 Toolbar check:", {
    exists: !!toolbar,
    visible: toolbar ? toolbar.offsetParent !== null : false,
    display: toolbar ? toolbar.style.display : 'N/A',
    position: toolbar ? toolbar.style.position : 'N/A'
  });
};

// Show load notification
setTimeout(() => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: #4CAF50;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-family: Arial;
    font-size: 12px;
    z-index: 1000000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    max-width: 300px;
    line-height: 1.3;
  `;
  
  notification.innerHTML = `
    <strong>✅ JP Vocab Extension Loaded</strong><br>
    <small>Click từ highlighted để xóa • Popup tự động theo scroll</small><br>
    <small>Debug: checkToolbar() | forceShowToolbar()</small>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove notification
  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 5000);
}, 100);

// Debug helper functions
window.stopWatchdog = function() {
  if (toolbarWatchdog) {
    clearInterval(toolbarWatchdog);
    toolbarWatchdog = null;
    console.log("🛑 Toolbar watchdog stopped");
  }
};

window.startWatchdog = function() {
  startToolbarWatchdog();
  console.log("▶️ Toolbar watchdog started");
};

window.checkToolbarStatus = function() {
  const toolbar = document.getElementById('jp-vocab-toolbar');
  if (!toolbar) {
    console.log("❌ Toolbar element not found");
    return false;
  }
  
  const computedStyle = window.getComputedStyle(toolbar);
  const status = {
    exists: true,
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    offsetParent: toolbar.offsetParent !== null,
    position: computedStyle.position,
    zIndex: computedStyle.zIndex
  };
  
  console.log("🔍 Toolbar status:", status);
  return status;
};

window.clearDeletedWords = async function() {
  await chrome.storage.local.set({ deletedWords: [] });
  console.log("🗑️ Deleted words list cleared");
  
  if (window.firebaseSync) {
    await window.firebaseSync.uploadToFirebase();
    console.log("📤 Changes uploaded to Firebase");
  }
};

window.showSyncStatus = async function() {
  const { words = [], deletedWords = [] } = await chrome.storage.local.get(['words', 'deletedWords']);
  console.log("📊 Current sync status:");
  console.log("  Active words:", words.length);
  console.log("  Deleted words:", deletedWords.length);
  console.log("  Words:", words);
  console.log("  Deleted:", deletedWords);
};

// Update debug commands log
console.log("🎯 Debug commands available:");
console.log("  - checkToolbarStatus() : Check detailed toolbar status");
console.log("  - forceShowToolbar() : Force show toolbar");
console.log("  - startWatchdog() : Start toolbar watchdog");
console.log("  - stopWatchdog() : Stop toolbar watchdog");
console.log("  - showSyncStatus() : Show current words and deleted words");
console.log("  - clearDeletedWords() : Clear deleted words list and sync");
console.log("  - window.enableToolbarWatchdog = true : Enable watchdog");
console.log("  - document.getElementById('jp-vocab-toolbar') : Get toolbar element");
