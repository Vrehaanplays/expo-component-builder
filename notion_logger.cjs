const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Dynamically extract the authenticated Notion token from the global helper script
// to avoid hardcoding secrets in the Git repository.
let notionToken = '';
try {
  const helperPath = 'C:\\Users\\vreha\\notion-helper.js';
  if (fs.existsSync(helperPath)) {
    const helperContent = fs.readFileSync(helperPath, 'utf8');
    const match = helperContent.match(/auth:\s*'([^']+)'/);
    if (match) {
      notionToken = match[1];
    }
  }
} catch (err) {
  console.error('Failed to read Notion token from global helper:', err.message);
}

if (!notionToken) {
  console.error('Error: Notion API token not found.');
  process.exit(1);
}

const notion = new Client({
  auth: notionToken,
});

const pageId = '371eff2c-d2ba-81e6-9bb9-d1e14bb1a0b2';

async function checkTodo(blockId) {
  try {
    await notion.blocks.update({
      block_id: blockId,
      to_do: { checked: true }
    });
    console.log(`Successfully checked todo block: ${blockId}`);
  } catch (err) {
    console.error(`Failed to check todo block ${blockId}:`, err.message);
  }
}

async function appendLog(text) {
  try {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: text } }]
          }
        }
      ]
    });
    console.log(`Successfully appended log: "${text}"`);
  } catch (err) {
    console.error(`Failed to append log:`, err.message);
  }
}

const command = process.argv[2];
const arg = process.argv.slice(3).join(' ');

if (command === 'check') {
  checkTodo(arg);
} else if (command === 'log') {
  appendLog(arg);
} else {
  console.log('Usage: node notion_logger.cjs [check <block-id> | log <text>]');
}
