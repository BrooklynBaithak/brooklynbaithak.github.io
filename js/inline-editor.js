(function() {
  // Check if edit mode is active in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('edit') === 'true';

  if (!isEditMode) return;

  // Add edit mode class to body
  document.body.classList.add('bb-edit-mode');

  // Load initial data injected from Jekyll
  const initialDataEl = document.getElementById('bb-cms-initial-data');
  const initialData = initialDataEl ? JSON.parse(initialDataEl.textContent) : {
    faq: [],
    events: [],
    quotes: [],
    timeline: [],
    people: []
  };

  // Deep clone lists to track current vs original state
  const originalLists = JSON.parse(JSON.stringify(initialData));
  const currentLists = JSON.parse(JSON.stringify(initialData));
  const nonListEdits = new Map();

  // Display names for add buttons
  const listNamesMap = {
    faq: 'FAQ Item',
    events: 'Event',
    quotes: 'Press Quote',
    timeline: 'Timeline Event',
    people: 'Team Member'
  };

  // Templates for list items
  const listTemplates = new Map();

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
    
    /* Hover badging for special fields (links, images) */
    .bb-edit-mode a[data-cms-key],
    .bb-edit-mode img[data-cms-key] {
      cursor: pointer !important;
    }
    
    .bb-media-edit-badge {
      position: absolute;
      top: -20px;
      right: 0;
      background: #c8a951;
      color: #121212;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .bb-edit-mode [data-cms-key]:hover .bb-media-edit-badge {
      opacity: 1;
    }
    
    /* Floating Control Panel */
    #bb-editor-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      background: rgba(18, 18, 18, 0.95);
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

    /* List Action Buttons */
    .bb-editor-del-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ff5252;
      color: white;
      border: none;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      transition: background 0.2s, transform 0.2s;
    }
    .bb-editor-del-btn:hover {
      background: #e53935;
      transform: scale(1.1);
    }
    
    .bb-editor-add-btn {
      display: block;
      width: calc(100% - 30px);
      margin: 20px auto;
      padding: 12px;
      border: 2px dashed #c8a951;
      background: rgba(200, 169, 81, 0.05);
      color: #c8a951;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      font-size: 14px;
    }
    .bb-editor-add-btn:hover {
      background: rgba(200, 169, 81, 0.15);
      transform: translateY(-1px);
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

  // Helper: Strip CMS key badge text from element content
  function getCleanText(el, key) {
    let text = el.textContent;
    if (text.endsWith(key)) {
      text = text.substring(0, text.length - key.length);
    }
    return text.trim();
  }

  // Parse list, index, and field from key (e.g. "story.timeline[2].heading" -> {list: "timeline", index: 2, field: "heading"})
  function parseCmsKey(key) {
    // Matches patterns like "faq[0].question" or "story.timeline[2].heading" or "people[1].bio"
    const match = key.match(/(?:.*\.)?([a-zA-Z0-9_]+)\[(\d+)\]\.([a-zA-Z0-9_]+)/);
    if (match) {
      return {
        list: match[1],
        index: parseInt(match[2], 10),
        field: match[3]
      };
    }
    return null;
  }

  // Helper to make an element editable and attach listeners
  function makeElementEditable(el) {
    const key = el.getAttribute('data-cms-key');
    if (!key) return;

    // Attach hover key badge
    const badge = document.createElement('span');
    badge.className = 'bb-field-badge';
    badge.textContent = key;
    el.appendChild(badge);

    if (el.tagName === 'A') {
      // Create a floating Link Edit label on hover
      const editBadge = document.createElement('span');
      editBadge.className = 'bb-media-edit-badge';
      editBadge.textContent = 'Edit Link URL';
      el.appendChild(editBadge);

      el.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentUrl = el.getAttribute('href') || '';
        const newUrl = prompt(`Enter URL for this link (${key}):`, currentUrl);
        if (newUrl !== null) {
          el.setAttribute('href', newUrl);
          
          const parsed = parseCmsKey(key);
          if (parsed && currentLists[parsed.list]) {
            currentLists[parsed.list][parsed.index][parsed.field] = newUrl;
          } else {
            nonListEdits.set(key, newUrl);
          }
          updateChangeCount();
        }
      });
      
      // Make link text content itself editable
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('input', () => {
        const text = getCleanText(el, key);
        const parsed = parseCmsKey(key);
        if (parsed && currentLists[parsed.list]) {
          currentLists[parsed.list][parsed.index].cta_text = text; // Usually cta_text or similar
        }
        updateChangeCount();
      });
      
    } else if (el.tagName === 'IMG') {
      // For images, we prompt on click
      const editBadge = document.createElement('span');
      editBadge.className = 'bb-media-edit-badge';
      editBadge.textContent = 'Edit Image Source';
      el.parentNode.style.position = 'relative';
      el.parentNode.appendChild(editBadge);

      el.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        
        let currentVal = el.getAttribute('src') || '';
        if (key.endsWith('.pic')) {
          currentVal = currentVal.replace('img/team/', '').replace('.jpg', '');
        }
        
        const promptMsg = key.endsWith('.pic') 
          ? "Enter profile image file name (under img/team/NAME.jpg):" 
          : "Enter image file path:";
        const newVal = prompt(promptMsg, currentVal);
        
        if (newVal !== null) {
          if (key.endsWith('.pic')) {
            el.setAttribute('src', `img/team/${newVal}.jpg`);
          } else {
            el.setAttribute('src', newVal);
          }
          
          const parsed = parseCmsKey(key);
          if (parsed && currentLists[parsed.list]) {
            currentLists[parsed.list][parsed.index][parsed.field] = newVal;
          } else {
            nonListEdits.set(key, newVal);
          }
          updateChangeCount();
        }
      });
      
    } else {
      // Normal text elements
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('input', () => {
        const text = getCleanText(el, key);
        const parsed = parseCmsKey(key);
        if (parsed && currentLists[parsed.list]) {
          currentLists[parsed.list][parsed.index][parsed.field] = text;
        } else {
          nonListEdits.set(key, text);
        }
        updateChangeCount();
      });
    }
  }

  // Handle list re-indexing
  function reindexList(listEl) {
    const listName = listEl.getAttribute('data-cms-list');
    const items = listEl.querySelectorAll('[data-cms-item]');
    
    items.forEach((item, index) => {
      item.setAttribute('data-cms-item', index);
      
      // Update all nested keys inside this item
      const editableFields = item.querySelectorAll('[data-cms-key]');
      editableFields.forEach(field => {
        const key = field.getAttribute('data-cms-key');
        
        // Replace index in key (e.g. faq[2].question -> faq[1].question)
        const newKey = key.replace(/\[\d+\]/, `[${index}]`);
        field.setAttribute('data-cms-key', newKey);
        
        // Update badge text if it exists
        const badge = field.querySelector('.bb-field-badge');
        if (badge) {
          badge.textContent = newKey;
        }
      });
    });
  }

  // Add delete button helper
  function addDeleteButton(item, listEl) {
    item.style.position = 'relative';
    const delBtn = document.createElement('button');
    delBtn.className = 'bb-editor-del-btn';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Delete Item';
    
    delBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const listName = listEl.getAttribute('data-cms-list');
      const itemIndex = parseInt(item.getAttribute('data-cms-item'), 10);
      
      if (confirm(`Are you sure you want to delete this ${listNamesMap[listName] || 'item'}?`)) {
        item.remove();
        currentLists[listName].splice(itemIndex, 1);
        reindexList(listEl);
        updateChangeCount();
      }
    });
    
    item.appendChild(delBtn);
  }

  // Add "+" add button helper
  function addAddButton(listEl) {
    const listName = listEl.getAttribute('data-cms-list');
    const addBtn = document.createElement('button');
    addBtn.className = 'bb-editor-add-btn';
    addBtn.textContent = `+ Add ${listNamesMap[listName] || 'Item'}`;
    
    addBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const template = listTemplates.get(listName);
      if (!template) {
        alert('Could not find template to add item.');
        return;
      }
      
      const clone = template.cloneNode(true);
      
      // Clean up clone elements
      const cloneDelBtn = clone.querySelector('.bb-editor-del-btn');
      if (cloneDelBtn) cloneDelBtn.remove();
      
      // Clear all fields and assign new temporary indices
      const fields = clone.querySelectorAll('[data-cms-key]');
      const nextIndex = currentLists[listName].length;
      
      // Create empty record in currentLists
      const newRecord = {};
      
      fields.forEach(field => {
        const key = field.getAttribute('data-cms-key');
        const parsed = parseCmsKey(key);
        if (parsed) {
          newRecord[parsed.field] = field.tagName === 'IMG' 
            ? 'placeholder' 
            : (field.tagName === 'A' ? '#' : 'New text element');
            
          // Update key in DOM
          const newKey = key.replace(/\[\d+\]/, `[${nextIndex}]`);
          field.setAttribute('data-cms-key', newKey);
        }
        
        // Clean values/content in clone DOM
        const badges = field.querySelectorAll('.bb-field-badge, .bb-media-edit-badge');
        badges.forEach(b => b.remove());
        
        if (field.tagName === 'IMG') {
          field.setAttribute('src', 'img/header-bg.jpg'); // Generic placeholder
        } else if (field.tagName === 'A') {
          field.setAttribute('href', '#');
          field.textContent = 'Click to edit link';
        } else {
          field.textContent = 'Click to edit text';
        }
      });
      
      currentLists[listName].push(newRecord);
      listEl.appendChild(clone);
      
      // Re-index to ensure all DOM state matches
      reindexList(listEl);
      
      // Make clone children editable
      const newFields = clone.querySelectorAll('[data-cms-key]');
      newFields.forEach(f => makeElementEditable(f));
      
      // Add delete button to cloned item
      addDeleteButton(clone, listEl);
      
      updateChangeCount();
    });
    
    // Insert button immediately after the list container
    listEl.parentNode.insertBefore(addBtn, listEl.nextSibling);
  }

  // Scan and Initialize all list containers and templates
  const listContainers = document.querySelectorAll('[data-cms-list]');
  listContainers.forEach(listEl => {
    const listName = listEl.getAttribute('data-cms-list');
    const firstItem = listEl.querySelector('[data-cms-item]');
    
    if (firstItem) {
      // Save cloned node as template
      listTemplates.set(listName, firstItem.cloneNode(true));
      
      // Add delete buttons to existing items
      const items = listEl.querySelectorAll('[data-cms-item]');
      items.forEach(item => addDeleteButton(item, listEl));
      
      // Add add button below the list
      addAddButton(listEl);
    }
  });

  // Make all data-cms-key fields editable
  const editableElements = document.querySelectorAll('[data-cms-key]');
  editableElements.forEach(el => makeElementEditable(el));

  // Inject Floating Editor Control Panel
  const panel = document.createElement('div');
  panel.id = 'bb-editor-panel';
  panel.innerHTML = `
    <h3>✦ BB Inline Editor</h3>
    <p>Click highlighted text to edit. Add/Delete lists inline. Saving pushes directly to GitHub.</p>
    <div class="bb-editor-status">
      <span>Status: <span class="unsaved" id="bb-status-text">No changes</span></span>
    </div>
    <div class="bb-editor-buttons">
      <button class="bb-editor-btn bb-editor-btn-primary" id="bb-save-btn">Save & Push to GitHub</button>
      <button class="bb-editor-btn bb-editor-btn-secondary" id="bb-discard-btn">Discard Changes</button>
      <button class="bb-editor-btn bb-editor-btn-secondary" id="bb-exit-btn">Exit Edit Mode</button>
    </div>
  `;
  document.body.appendChild(panel);

  function countChanges() {
    let changes = 0;
    
    // Count modified list fields
    for (const listName in currentLists) {
      if (JSON.stringify(currentLists[listName]) !== JSON.stringify(originalLists[listName])) {
        changes++;
      }
    }
    
    // Count non-list edits
    changes += nonListEdits.size;
    return changes;
  }

  function updateChangeCount() {
    const changeCount = countChanges();
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
    if (countChanges() === 0 || confirm('Are you sure you want to discard all changes and reload?')) {
      window.location.reload();
    }
  });

  // Handle Exit
  document.getElementById('bb-exit-btn').addEventListener('click', () => {
    urlParams.delete('edit');
    window.location.search = urlParams.toString();
  });

  // Handle Save (sending updates to the local WEBrick backend servlet)
  document.getElementById('bb-save-btn').addEventListener('click', () => {
    if (countChanges() === 0) {
      alert('No changes to save.');
      return;
    }

    // Prepare edits array to send to backend API
    const editsToSend = [];

    // 1. Process modified lists
    // Map listName to the respective file path and key path expected by the backend
    const listFileMapping = {
      faq: { file: '_data/faq.yml', key: 'faq' },
      events: { file: '_data/events.yml', key: 'events' },
      quotes: { file: '_data/press.yml', key: 'quotes' },
      timeline: { file: '_data/story.yml', key: 'timeline' },
      people: { file: '_config.yml', key: 'people' }
    };

    for (const listName in currentLists) {
      if (JSON.stringify(currentLists[listName]) !== JSON.stringify(originalLists[listName])) {
        const mapping = listFileMapping[listName];
        if (mapping) {
          // Send the entire updated array for this list
          editsToSend.push({
            file: mapping.file,
            key: mapping.key,
            value: currentLists[listName]
          });
        }
      }
    }

    // 2. Process non-list edits (subheadings, etc.)
    nonListEdits.forEach((val, key) => {
      // Determine target file based on prefix
      let file = '_config.yml';
      if (key.startsWith('services.')) file = '_data/services.yml';
      else if (key.startsWith('mission.')) file = '_data/mission.yml';
      else if (key.startsWith('story.')) file = '_data/story.yml';
      else if (key.startsWith('impact.')) file = '_data/impact.yml';
      else if (key.startsWith('testimonials.')) file = '_data/testimonials.yml';
      else if (key.startsWith('faq.')) file = '_data/faq.yml';
      
      editsToSend.push({
        file,
        key,
        value: val
      });
    });

    const saveBtn = document.getElementById('bb-save-btn');
    const statusText = document.getElementById('bb-status-text');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving & Pushing...';
    statusText.textContent = 'Updating files & pushing...';
    statusText.style.color = '#c8a951';

    // POST edits to our background Ruby plugin server
    fetch('http://localhost:4002/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ edits: editsToSend })
    })
    .then(res => {
      if (!res.ok) throw new Error('HTTP error ' + res.status);
      return res.json();
    })
    .then(data => {
      if (data.status === 'success') {
        alert(`Successfully saved changes and pushed to branch "${data.branch}"!\n\nThis will trigger your GitHub Actions / Netlify rebuild.`);
        // Reload to render new state
        window.location.reload();
      } else {
        alert('Failed to save: ' + data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Could not connect to the local saving API. Make sure Jekyll is serving the site locally.');
    })
    .finally(() => {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Push to GitHub';
      updateChangeCount();
    });
  });
})();
