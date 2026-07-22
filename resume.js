// Resume: fetch dylanquesada.json -> render site-styled HTML + Markdown/PDF downloads

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

function renderResume(r) {
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const c = r.contact || {};
  const h = [];

  h.push('<div class="resume-id">');
  h.push(`<span class="resume-name">${esc(r.name)}</span>`);
  if (r.title) h.push(`<span class="resume-title">${esc(r.title)}</span>`);
  const bits = [c.location, c.phone, c.email].filter(Boolean).map(esc);
  const linkedin = c.linkedin
    ? ` · <a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`
    : '';
  h.push(`<span class="resume-contact">${bits.join(' · ')}${linkedin}</span>`);
  h.push('</div>');

  if (r.summary) {
    h.push('<h3 class="resume-heading">Professional Summary</h3>');
    h.push(`<p class="resume-summary">${esc(r.summary)}</p>`);
  }

  if (r.skills && r.skills.length) {
    h.push('<h3 class="resume-heading">Skills</h3>');
    h.push(`<div class="project-tags resume-skills">${r.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>`);
  }

  if (r.work && r.work.length) {
    h.push('<h3 class="resume-heading">Work History</h3>');
    h.push('<div class="resume-group">');
    r.work.forEach((job) => {
      h.push('<div class="exp-item">');
      h.push(`<span class="exp-role">${esc(job.role)}</span>`);
      h.push(`<span class="exp-company">${esc(job.company)}${job.location ? ` — ${esc(job.location)}` : ''}</span>`);
      h.push(`<span class="exp-date">${esc(job.dates || '')}</span>`);
      if (job.bullets && job.bullets.length) {
        h.push(`<ul class="exp-detail resume-bullets">${job.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`);
      }
      h.push('</div>');
    });
    h.push('</div>');
  }

  if (r.education && r.education.length) {
    h.push('<h3 class="resume-heading">Education</h3>');
    h.push('<div class="resume-group">');
    r.education.forEach((e) => {
      h.push('<div class="exp-item">');
      h.push(`<span class="exp-role">${esc(e.credential)}</span>`);
      h.push(`<span class="exp-company">${esc(e.institution)}</span>`);
      h.push(`<span class="exp-date">${esc(e.date || '')}</span>`);
      h.push('</div>');
    });
    h.push('</div>');
  }

  if (r.projects && r.projects.length) {
    h.push('<h3 class="resume-heading">Projects</h3>');
    h.push(`<ul class="resume-bullets resume-projects">${r.projects
      .map((p) => `<li><strong>${esc(p.name)}</strong> — ${esc(p.description)}</li>`)
      .join('')}</ul>`);
  }

  return h.join('\n');
}

async function initResume() {
  const container = document.getElementById('resume-md');
  try {
    const res = await fetch('dylanquesada.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const md = toMarkdown(data);

    container.innerHTML = renderResume(data);

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

    document.getElementById('download-pdf').addEventListener('click', () => {
      const prevTitle = document.title;
      document.title = 'DYLAN_QUESADA_Resume';
      window.print();
      document.title = prevTitle;
    });
  } catch (err) {
    container.innerHTML =
      '<p class="resume-error">Could not load resume data. If you opened this page from disk, serve it over HTTP (e.g. <code>npx serve</code>).</p>';
  }
}

initResume();
