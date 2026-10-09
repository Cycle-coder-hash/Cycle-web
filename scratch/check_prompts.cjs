const fs = require('fs');

const prompts = JSON.parse(fs.readFileSync('scratch_prompts.json', 'utf8'));

// Focus on all user prompts since step 170
for (let i = 170; i < prompts.length; i++) {
  const p = prompts[i];
  const content = p.content.replace(/<USER_REQUEST>/g, '').replace(/<\/USER_REQUEST>/g, '').replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '').trim();
  
  // Extract key summary
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  console.log(`\n============================================================`);
  console.log(`PROMPT #${i} (Step ${p.step_index}, Time: ${p.created_at})`);
  console.log(`Title/First lines:`);
  console.log(lines.slice(0, 4).join('\n'));
  console.log(`------------------------------------------------------------`);
}
