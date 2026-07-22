// Resume: fetch dylanquesada.json -> build Markdown -> render + download

function toMarkdown(r) {
  const lines = [];
  const c = r.contact || {};

  lines.push(`# ${r.name}`);
  if (r.title) lines.push(`**${r.title}**`);
  lines.push('');
  lines.push([c.location, c.phone, c.email].filter(Boolean).join(' · '));
  if (c.linkedin) lines.push(`[LinkedIn](${c.linkedin})`);
  lines.push('');

  if (r.summary) {
    lines.push('## Professional Summary', '', r.summary, '');
  }

  if (r.skills && r.skills.length) {
    lines.push('## Skills', '', r.skills.join(' · '), '');
  }

  if (r.work && r.work.length) {
    lines.push('## Work History', '');
    r.work.forEach((job) => {
      lines.push(`### ${job.role} — ${job.company}`);
      lines.push(`*${[job.location, job.dates].filter(Boolean).join(' · ')}*`);
      lines.push('');
      (job.bullets || []).forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    });
  }

  if (r.education && r.education.length) {
    lines.push('## Education', '');
    r.education.forEach((e) => {
      const date = e.date ? ` (${e.date})` : '';
      lines.push(`- **${e.credential}** — ${e.institution}${date}`);
    });
    lines.push('');
  }

  if (r.projects && r.projects.length) {
    lines.push('## Projects', '');
    r.projects.forEach((p) => {
      lines.push(`- **${p.name}** — ${p.description}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

// Minimal renderer for the Markdown this page generates:
// #/##/### headings, - lists, **bold**, *italic*, [text](url), paragraphs.
function renderMarkdown(md) {
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s) =>
    escape(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const html = [];
  let inList = false;
  const closeList = () => {
    if (inList) { html.push('</ul>'); inList = false; }
  };

  md.split('\n').forEach((line) => {
    if (line.startsWith('- ')) {
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      return;
    }
    closeList();
    if (line.startsWith('### ')) html.push(`<h4>${inline(line.slice(4))}</h4>`);
    else if (line.startsWith('## ')) html.push(`<h3>${inline(line.slice(3))}</h3>`);
    else if (line.startsWith('# ')) html.push(`<h2 class="resume-name">${inline(line.slice(2))}</h2>`);
    else if (line.trim() !== '') html.push(`<p>${inline(line)}</p>`);
  });
  closeList();

  return html.join('\n');
}

async function initResume() {
  const container = document.getElementById('resume-md');
  try {
    const res = await fetch('dylanquesada.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const md = toMarkdown(data);

    container.innerHTML = renderMarkdown(md);

    document.getElementById('download-md').addEventListener('click', () => {
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DYLAN_QUESADA_Resume.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  } catch (err) {
    container.innerHTML =
      '<p class="resume-error">Could not load resume data. If you opened this page from disk, serve it over HTTP (e.g. <code>npx serve</code>).</p>';
  }
}

initResume();
