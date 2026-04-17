// Language configuration (ready for future expansion)
const translations = {
    en: {
        title: "JSON Formatter",
        format: "Format",
        validate: "Validate",
        minify: "Minify",
        clear: "Clear",
        copy: "Copy",
        treeView: "Tree View",
        inputLabel: "Input JSON:",
        outputLabel: "Output:",
        placeholder: 'Paste your JSON here... e.g., {"name":"John","age":30}',
        errorInvalid: "Invalid JSON",
        successValid: "Valid JSON!",
        successCopied: "Copied to clipboard!",
        successFormatted: "JSON formatted successfully!",
        successMinified: "JSON minified successfully!"
    }
    // Add more languages here in the future
    // es: { ... },
    // ja: { ... }
};

let currentLang = 'en';
const t = translations[currentLang];

// DOM Elements
const inputArea = document.getElementById('input');
const outputArea = document.getElementById('output');
const formatBtn = document.getElementById('formatBtn');
const validateBtn = document.getElementById('validateBtn');
const minifyBtn = document.getElementById('minifyBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const treeViewBtn = document.getElementById('treeViewBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

let isTreeView = false;

// Format JSON
function formatJSON() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            showError('Please enter some JSON data');
            return;
        }

        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        outputArea.textContent = formatted;
        outputArea.classList.remove('tree-view');
        isTreeView = false;
        showSuccess(t.successFormatted);
        hideError();
    } catch (error) {
        showError(`${t.errorInvalid}: ${error.message}`);
        outputArea.textContent = '';
    }
}

// Validate JSON
function validateJSON() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            showError('Please enter some JSON data');
            return;
        }

        JSON.parse(input);
        showSuccess(`${t.successValid} ✓`);
        hideError();
    } catch (error) {
        const errorMsg = parseErrorMessage(error.message, inputArea.value);
        showError(errorMsg);
    }
}

// Parse error message to show line and position
function parseErrorMessage(errorMsg, input) {
    const posMatch = errorMsg.match(/position (\d+)/);
    if (posMatch) {
        const position = parseInt(posMatch[1]);
        const lines = input.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        return `${t.errorInvalid} at line ${lineNumber}, column ${columnNumber}: ${errorMsg}`;
    }
    return `${t.errorInvalid}: ${errorMsg}`;
}

// Minify JSON
function minifyJSON() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            showError('Please enter some JSON data');
            return;
        }

        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        outputArea.textContent = minified;
        outputArea.classList.remove('tree-view');
        isTreeView = false;
        showSuccess(t.successMinified);
        hideError();
    } catch (error) {
        showError(`${t.errorInvalid}: ${error.message}`);
        outputArea.textContent = '';
    }
}

// Clear all
function clearAll() {
    inputArea.value = '';
    outputArea.textContent = '';
    outputArea.innerHTML = '';
    hideError();
    hideSuccess();
    isTreeView = false;
}

// Copy to clipboard
async function copyToClipboard() {
    const text = outputArea.textContent;
    if (!text) {
        showError('Nothing to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showSuccess(t.successCopied);
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSuccess(t.successCopied);
    }
}

// Tree View
function showTreeView() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            showError('Please enter some JSON data');
            return;
        }

        const parsed = JSON.parse(input);
        outputArea.innerHTML = '';
        outputArea.classList.add('tree-view');

        const treeHTML = createTreeNode(parsed, 'root');
        outputArea.innerHTML = treeHTML;

        isTreeView = true;
        hideError();
        showSuccess('Tree view generated!');

        // Add click handlers for collapsible nodes
        addTreeToggleHandlers();
    } catch (error) {
        showError(`${t.errorInvalid}: ${error.message}`);
        outputArea.innerHTML = '';
    }
}

// Create tree node HTML
function createTreeNode(obj, key, level = 0) {
    const indent = '  '.repeat(level);

    if (obj === null) {
        return `${indent}<span class="tree-key">${key}</span>: <span class="tree-null">null</span>`;
    }

    if (typeof obj === 'string') {
        return `${indent}<span class="tree-key">${key}</span>: <span class="tree-string">"${escapeHtml(obj)}"</span>`;
    }

    if (typeof obj === 'number') {
        return `${indent}<span class="tree-key">${key}</span>: <span class="tree-number">${obj}</span>`;
    }

    if (typeof obj === 'boolean') {
        return `${indent}<span class="tree-key">${key}</span>: <span class="tree-boolean">${obj}</span>`;
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return `${indent}<span class="tree-key">${key}</span>: []`;
        }

        let html = `${indent}<span class="tree-toggle" data-collapsed="false">▼</span><span class="tree-key">${key}</span>: [\n`;
        html += '<div class="tree-node">';
        obj.forEach((item, index) => {
            html += createTreeNode(item, index, level + 1) + '\n';
        });
        html += '</div>';
        html += `${indent}]`;
        return html;
    }

    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return `${indent}<span class="tree-key">${key}</span>: {}`;
        }

        let html = `${indent}<span class="tree-toggle" data-collapsed="false">▼</span><span class="tree-key">${key}</span>: {\n`;
        html += '<div class="tree-node">';
        keys.forEach(k => {
            html += createTreeNode(obj[k], k, level + 1) + '\n';
        });
        html += '</div>';
        html += `${indent}}`;
        return html;
    }

    return '';
}

// Add toggle handlers for tree view
function addTreeToggleHandlers() {
    const toggles = outputArea.querySelectorAll('.tree-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const isCollapsed = this.getAttribute('data-collapsed') === 'true';
            const node = this.nextElementSibling.nextElementSibling; // Skip the key span

            if (node && node.classList.contains('tree-node')) {
                if (isCollapsed) {
                    node.style.display = 'block';
                    this.textContent = '▼';
                    this.setAttribute('data-collapsed', 'false');
                } else {
                    node.style.display = 'none';
                    this.textContent = '▶';
                    this.setAttribute('data-collapsed', 'true');
                }
            }
        });
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => {
        hideSuccess();
    }, 3000);
}

// Hide success message
function hideSuccess() {
    successMessage.classList.remove('show');
}

// Event Listeners
formatBtn.addEventListener('click', formatJSON);
validateBtn.addEventListener('click', validateJSON);
minifyBtn.addEventListener('click', minifyJSON);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyToClipboard);
treeViewBtn.addEventListener('click', showTreeView);

// Keyboard shortcuts
inputArea.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formatJSON();
    }

    // Tab key support
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = inputArea.selectionStart;
        const end = inputArea.selectionEnd;
        inputArea.value = inputArea.value.substring(0, start) + '  ' + inputArea.value.substring(end);
        inputArea.selectionStart = inputArea.selectionEnd = start + 2;
    }
});

// Sample JSON for demo (optional - can be removed)
const sampleJSON = {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
    },
    "hobbies": ["reading", "coding", "traveling"],
    "isActive": true,
    "balance": 1250.50
};

// Uncomment to load sample JSON on page load
// inputArea.value = JSON.stringify(sampleJSON);
