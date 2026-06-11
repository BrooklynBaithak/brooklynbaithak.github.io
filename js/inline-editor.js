(function() {
  // Check if edit mode is active in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('edit') === 'true';

  if (!isEditMode) return;

  // Add edit mode class to body
  document.body.classList.add('bb-edit-mode');

  // Inject Custom Styles for Edit Mode
  const styles = `
    .bb-edit-mode [data-cms-key] {
      outline: 2px dashed #c8a951 !important;
      outline-offset: 4px !important;
      transition: all 0.2s ease !important;
      position: relative !important;
    }
    .bb-edit-mode [data-cms-key]:hover {
      background-color: rgba(200, 169, 81, 0.1) !important;
      cursor: text !important;
    }
    .bb-edit-mode [data-cms-key]:focus {
      outline: 2px solid #c8a951 !important;
      background-color: rgba(200, 169, 81, 0.05) !important;
    }
    
    /* Floating Control Panel */
    #bb-editor-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      background: rgba(18, 18, 18, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(200, 169, 81, 0.4);
      border-radius: 16px;
      color: #f5f5f5;
      padding: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      z-index: 999999;
      font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    #bb-editor-panel h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 700;
      color: #c8a951;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    #bb-editor-panel p {
      margin: 0 0 16px 0;
      font-size: 12px;
      color: #b0b0b0;
      line-height: 1.5;
    }
    
    .bb-editor-status {
      font-size: 11px;
      background: rgba(200, 169, 81, 0.15);
      border: 1px solid rgba(200, 169, 81, 0.3);
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      color: #e0e0e0;
    }
    
    .bb-editor-status span.unsaved {
      color: #ffb74d;
      font-weight: bold;
    }

    .bb-editor-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .bb-editor-btn {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
      border: none;
      width: 100%;
    }
    
    .bb-editor-btn-primary {
      background: #c8a951;
      color: #121212;
    }
    
    .bb-editor-btn-primary:hover {
      background: #dfbe60;
      transform: translateY(-1px);
    }
    
    .bb-editor-btn-secondary {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ccc;
    }
    
    .bb-editor-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    /* Tooltip / Badges for fields */
    .bb-field-badge {
      position: absolute;
      top: -20px;
      left: 0;
      background: #c8a951;
      color: #121212;
      font-size: 9px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1000;
      font-family: monospace;
      white-space: nowrap;
    }

    [data-cms-key]:hover .bb-field-badge {
      opacity: 1;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  // Initialize editable elements and insert badges
  const editableElements = document.querySelectorAll('[data-cms-key]');
  let changeCount = 0;
  const originalValues = new Map();

  editableElements.forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.style.position = 'relative';

    // Store original text
    const key = el.getAttribute('data-cms-key');
    originalValues.set(key, el.textContent.trim());

    // Create field key badge
    const badge = document.createElement('span');
    badge.className = 'bb-field-badge';
    badge.textContent = key;
    el.appendChild(badge);

    // Track input
    el.addEventListener('input', () => {
      updateChangeCount();
    });
  });

  // Inject Floating Editor Control Panel
  const panel = document.createElement('div');
  panel.id = 'bb-editor-panel';
  panel.innerHTML = `
    <h3>✦ BB Inline Editor</h3>
    <p>Click any highlighted text on the page to edit. Edits are stored locally until saved.</p>
    <div class="bb-editor-status">
      <span>Status: <span class="unsaved" id="bb-status-text">No changes</span></span>
    </div>
    <div class="bb-editor-buttons">
      <button class="bb-editor-btn bb-editor-btn-primary" id="bb-save-btn">Save & Download faq.yml</button>
      <button class="bb-editor-btn bb-editor-btn-secondary" id="bb-discard-btn">Discard Changes</button>
      <button class="bb-editor-btn bb-editor-btn-secondary" id="bb-exit-btn">Exit Edit Mode</button>
    </div>
  `;
  document.body.appendChild(panel);

  function updateChangeCount() {
    let currentChanges = 0;
    editableElements.forEach(el => {
      const key = el.getAttribute('data-cms-key');
      // TextContent minus the badge text
      let text = el.textContent;
      if (text.endsWith(key)) {
        text = text.substring(0, text.length - key.length);
      }
      text = text.trim();
      if (text !== originalValues.get(key)) {
        currentChanges++;
      }
    });

    changeCount = currentChanges;
    const statusText = document.getElementById('bb-status-text');
    if (changeCount > 0) {
      statusText.textContent = `${changeCount} change(s) unsaved`;
      statusText.style.color = '#ffb74d';
    } else {
      statusText.textContent = 'No changes';
      statusText.style.color = '#e0e0e0';
    }
  }

  // Handle Discard
  document.getElementById('bb-discard-btn').addEventListener('click', () => {
    if (changeCount === 0 || confirm('Are you sure you want to discard all changes?')) {
      editableElements.forEach(el => {
        const key = el.getAttribute('data-cms-key');
        // Keep the badge
        const badge = el.querySelector('.bb-field-badge');
        el.textContent = originalValues.get(key);
        if (badge) el.appendChild(badge);
      });
      updateChangeCount();
    }
  });

  // Handle Exit
  document.getElementById('bb-exit-btn').addEventListener('click', () => {
    urlParams.delete('edit');
    window.location.search = urlParams.toString();
  });

  // Handle Save (generating updated YAML for _data/faq.yml)
  document.getElementById('bb-save-btn').addEventListener('click', () => {
    const faqData = [];

    // Group elements by their loop index
    editableElements.forEach(el => {
      const key = el.getAttribute('data-cms-key');
      const file = el.getAttribute('data-cms-file');
      
      // Parse e.g., "faq[0].question"
      const match = key.match(/faq\[(\d+)\]\.(question|answer)/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        
        // Extract text content safely excluding the badge text
        let text = el.textContent;
        if (text.endsWith(key)) {
          text = text.substring(0, text.length - key.length);
        }
        text = text.trim();

        if (!faqData[index]) {
          faqData[index] = {};
        }
        faqData[index][field] = text;
      }
    });

    // Generate YAML output
    let yamlOutput = '';
    faqData.forEach((item, index) => {
      if (!item.question && !item.answer) return;
      
      const question = item.question || '';
      const answer = item.answer || '';
      
      yamlOutput += `- question: ${question}\n`;
      
      // Handle multiline answers nicely
      if (answer.includes('\n') || answer.length > 80) {
        // Clean line ends and indent answers by 4 spaces
        const lines = answer.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => `    ${line}`)
          .join('\n');
        yamlOutput += `  answer: >\n${lines}\n\n`;
      } else {
        yamlOutput += `  answer: ${answer}\n\n`;
      }
    });

    // Create a blob and trigger download
    const blob = new Blob([yamlOutput], { type: 'text/yaml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'faq.yml');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Prompt user to copy/paste instructions
    alert('YAML file downloaded successfully!\n\nPlease replace the contents of "_data/faq.yml" with this downloaded file to save your changes.');
  });
})();
