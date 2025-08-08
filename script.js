// i18n translations
const translations = {
  en: { newCase:'New Case', titleLabel:'Title:', descriptionLabel:'Description:', evidenceLabel:'Evidence File:', createCaseButton:'Create Case', cases:'Cases', summarize:'Summarize with AI', translate:'Translate' },
  he: { newCase:'תיק חדש', titleLabel:'כותרת:', descriptionLabel:'תיאור:', evidenceLabel:'קובץ ראיות:', createCaseButton:'צור תיק', cases:'תיקים', summarize:'סכם עם AI', translate:'תרגם' },
  ar: { newCase:'قضية جديدة', titleLabel:'عنوان:', descriptionLabel:'وصف:', evidenceLabel:'ملف الأدلة:', createCaseButton:'أنشئ قضية', cases:'القضايا', summarize:'تلخيص بالذكاء', translate:'ترجمة' },
  es: { newCase:'Nuevo Caso', titleLabel:'Título:', descriptionLabel:'Descripción:', evidenceLabel:'Archivo de Evidencia:', createCaseButton:'Crear Caso', cases:'Casos', summarize:'Resumir con IA', translate:'Traducir' },
  fr: { newCase:'Nouveau Cas', titleLabel:'Titre:', descriptionLabel:'Description:', evidenceLabel:'Fichier de Preuve:', createCaseButton:'Créer un Cas', cases:'Cas', summarize:'Résumer avec IA', translate:'Traduire' }
};

let currentLanguage = 'en';

function changeLanguage() {
  const lang = document.getElementById('languageSelect').value;
  currentLanguage = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
  });
}

async function loadCases() {
  const res = await fetch('/api/cases', { headers: await authHeaders() });
  if (!res.ok) { alert('Failed to load cases'); return; }
  const data = await res.json();
  const list = document.getElementById('casesList');
  list.innerHTML = '';
  for (const c of data) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${c.title}</strong><p>${c.description || ''}</p><small>${new Date(c.created_at).toLocaleString()}</small>`;
    list.appendChild(li);
  }
}

async function createCase(ev) {
  ev.preventDefault();
  const title = document.getElementById('caseTitle').value.trim();
  const description = document.getElementById('caseDescription').value.trim();
  if (!title) return alert('Title is required');
  const res = await fetch('/api/cases', {
    method:'POST',
    headers: { ...(await authHeaders()), 'Content-Type':'application/json' },
    body: JSON.stringify({ title, description })
  });
  if (!res.ok) { const e = await res.json(); alert(e.error || 'Failed to create case'); return; }
  document.getElementById('caseForm').reset();
  document.getElementById('aiResult').textContent = '';
  loadCases();
}

async function hashFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('SHA-256:', hex, 'size', file.size);
  // send to server
  const res = await fetch('/api/evidence', {
    method:'POST',
    headers:{ ...(await authHeaders()), 'Content-Type':'application/json' },
    body: JSON.stringify({ case_id:null, filename:file.name, sha256:hex, size_bytes:file.size, metadata:{} })
  });
  if (!res.ok) { const e = await res.json(); console.error('Evidence upload error', e); }
}

async function summarizeAI() {
  const text = document.getElementById('caseDescription').value;
  if (!text) return alert('Nothing to summarize');
  const res = await fetch('/api/summarize', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ text }) });
  const data = await res.json();
  document.getElementById('aiResult').textContent = data.summary || 'No summary';
}

async function translateDescription() {
  const text = document.getElementById('caseDescription').value;
  if (!text) return alert('Nothing to translate');
  const res = await fetch('/api/translate', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ text, targetLang: currentLanguage }) });
  const data = await res.json();
  document.getElementById('caseDescription').value = data.translation || text;
  document.getElementById('aiResult').textContent = 'Translated.';
}

async function seedDemo() {
  const res = await fetch('/api/seed_demo', { method:'POST', headers: await authHeaders() });
  if (!res.ok) { alert('Seed failed'); return; }
  alert('Demo seeded');
  loadCases();
}

async function authHeaders() {
  // get user session via supabase-auth-helpers: call to /api/public_env to get anon key, but for now return empty since login not implemented
  return {};
}

document.addEventListener('DOMContentLoaded', () => {
  changeLanguage();
  loadCases();
});