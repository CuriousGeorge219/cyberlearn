const fs = require('fs');
const path = require('path');
const { extractPdf, extractPptx } = require('./extract');

const ROOT = __dirname;

// ---------------------------------------------------------------------------
// Module metadata
// ---------------------------------------------------------------------------
const MODULES = [
  {
    id: 'cso', dir: 'CSO', name: 'CyberOps Associate', short: 'CSO', icon: '🛡️', color: '#38bdf8',
    description: 'Cisco CyberOps Associate v1.0 — network security operations, threat analysis, cryptography, and incident response.',
  },
  {
    id: 'naf', dir: 'NAF', name: 'Network Analysis & Forensics', short: 'NAF', icon: '🔍', color: '#34d399',
    description: 'Packet-level network analysis, TCP/IP forensics, capture techniques, and intrusion detection.',
  },
  {
    id: 'firewall', dir: 'Firewall', name: 'Firewall Technologies', short: 'Firewall', icon: '🧱', color: '#fb923c',
    description: 'Network perimeter defence, firewall configuration, VPNs, IDS, and disaster recovery.',
  },
  {
    id: 'aic', dir: 'AIC', name: 'AI in Cybersecurity', short: 'AIC', icon: '🤖', color: '#c084fc',
    description: 'How AI reshapes threat detection — machine learning, generative AI, agentic AI, and ethical hacking.',
  },
];

// Known NAF chapter titles (course decks are lowercase in filenames)
const NAF_TITLES = {
  1: 'Network Analysis & Forensics',
  2: 'TCP/IP Protocols',
  3: 'TCP/IP Packet Structure',
  4: 'Packet Capture',
  5: 'Analysing Captures',
  6: 'Attack Types & Preparing for Attacks',
  7: 'Preparing for Attacks',
  8: 'Network Scanning',
  9: 'Intrusion Detection System',
  10: 'Discover Location Awareness',
  11: 'Wireless Network Forensics',
};

function cleanName(s) {
  return s
    .replace(/[_]+/g, ' ')
    .replace(/\s*[-–—]\s*/g, ' ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripJunk(s) {
  return s
    .replace(/\s*(revised|revision)\s*$/i, '')
    .replace(/\s*v\.?\d+(\.\d+)?\s*$/i, '')
    .replace(/\s*_v\d+(\.\d+)?\s*$/i, '')
    .replace(/\s*AY\d{4}\s*$/i, '')
    .replace(/\s*\(\d+\)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns { sortKey:number|string, title:string }
function parseFileMeta(moduleId, file) {
  const base = file.replace(/\.(pdf|pptx)$/i, '');

  if (moduleId === 'naf') {
    // Visual deck (no chapter number)
    if (/Understanding/i.test(base) && !/ch\d+/i.test(base)) {
      return { sortKey: 99, title: 'Packet Bytes: Understanding & Interpreting (Visual)' };
    }
    const cm = base.match(/ch(\d+)/i);
    const chapter = cm ? parseInt(cm[1], 10) : 98;
    const title = NAF_TITLES[chapter] || (cm ? `Chapter ${chapter}` : base);
    return { sortKey: chapter, title: title.startsWith('Chapter') ? title : `Chapter ${chapter}: ${title}` };
  }

  if (moduleId === 'firewall') {
    const tm = base.match(/Topic\s+([A-F])/i);
    const letter = tm ? tm[1].toUpperCase() : 'Z';
    const pm = base.match(/Part[_\s]*(\d)/i);
    const part = pm ? parseInt(pm[1], 10) : 0;
    let name = base;
    const nm = base.match(/Topic\s+[A-F][_\s-]*(.*)$/i);
    if (nm) name = nm[1];
    name = cleanName(name);
    name = stripJunk(name);
    name = name.replace(/\s*Part\s*\d+\s*$/i, '');
    const sortKey = letter.charCodeAt(0) * 100 + part;
    return { sortKey, title: `Topic ${letter}: ${name}${part ? ` — Part ${part}` : ''}` };
  }

  if (moduleId === 'aic') {
    const wm = base.match(/Wk\s*(\d+)/i);
    const week = wm ? parseInt(wm[1], 10) : 999;
    let name = base;
    const nm = base.match(/Wk\s*\d+\s*[-_:]?\s*(.*)$/i);
    if (nm) name = nm[1];
    name = stripJunk(cleanName(name));
    return { sortKey: week, title: `Week ${week}: ${name}` };
  }

  // CSO
  const mm = base.match(/^(\d+)[.)\s]\s*(.*)$/);
  const num = mm ? parseInt(mm[1], 10) : 999;
  let name = mm ? mm[2] : base;
  name = stripJunk(cleanName(name));
  if (name.toLowerCase() === 'window operating system') name = 'Windows Operating System';
  return { sortKey: num, title: `Module ${num}: ${name}` };
}

// ---------------------------------------------------------------------------
// Cleaning
// ---------------------------------------------------------------------------
function cleanLines(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let raw of lines) {
    let l = raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!l) continue;
    if (/^---+ (PAGE|SLIDE) \d+ ---+$/i.test(l)) { out.push('@@DIVIDER@@'); continue; }
    if (/\d*©\s*\d{4}.*Cisco.*Confidential/i.test(l)) continue;
    if (/Cisco Confidential/i.test(l) && l.length < 120) continue;
    if (/^Official\s*\((Closed|Confidential|Internal),?\s*Non-Sensitive\)$/i.test(l)) continue;
    if (/^\d{1,3}$/.test(l)) continue;
    if (/^Ch\d+\s*[–—-].*\d+$/.test(l) && l.length < 70) continue;
    out.push(l);
  }
  const final = [];
  for (const l of out) {
    if (l === '@@DIVIDER@@') {
      if (final.length && final[final.length - 1] !== '@@DIVIDER@@') final.push(l);
      continue;
    }
    final.push(l);
  }
  return final;
}

// ---------------------------------------------------------------------------
// Block parsing
// ---------------------------------------------------------------------------
const HEADING_RE = [
  /^(Module\s+\d+|Chapter\s+\d+|Topic\s+[A-F]|[0-9]+\.[0-9]+|[0-9]+\.[0-9]\b|\d+\.\d+\s)/i,
  /^(Module Objectives|Module Title|Module Objective|Learning Objectives|Objectives|Key Terms|Summary|Introduction|Conclusion|References|Overview|What You Will Learn)$/i,
];

function isBullet(l) {
  return /^[•▪◦●·–—-]\s+/.test(l) || /^[oO]\s+/.test(l);
}

function isStrongHeading(l) {
  for (const re of HEADING_RE) if (re.test(l)) return true;
  return false;
}
function isWeakHeading(l) {
  return l.length <= 64 && !/[.!?;,]$/.test(l) && /^[A-Z0-9]/.test(l) && !isBullet(l) && l.split(' ').length <= 8;
}

function parseBlocks(lines) {
  const blocks = [];
  let bullets = [];
  let para = [];
  function flushBullets() { if (bullets.length) { blocks.push({ type: 'bullets', items: bullets }); bullets = []; } }
  function flushPara() { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = []; } }

  for (const l of lines) {
    if (l === '@@DIVIDER@@') { flushBullets(); flushPara(); blocks.push({ type: 'divider' }); continue; }
    // Weak heading heuristic only applies when we are NOT mid-bullet, so wrapped
    // bullet continuation lines don't get misread as headings.
    const heading = isStrongHeading(l) || (bullets.length === 0 && isWeakHeading(l));
    if (heading) { flushBullets(); flushPara(); blocks.push({ type: 'heading', text: l }); continue; }
    if (isBullet(l)) { flushPara(); bullets.push(l.replace(/^[•▪◦●·–—-]\s+/, '').replace(/^[oO]\s+/, '')); continue; }
    // Continuation of a wrapped bullet, otherwise a normal paragraph line
    if (bullets.length) { bullets[bullets.length - 1] += ' ' + l; }
    else { para.push(l); }
  }
  flushBullets(); flushPara();
  return blocks.filter(b => b.type !== 'heading' || b.text.length >= 2);
}

// ---------------------------------------------------------------------------
// Knowledge extraction
// ---------------------------------------------------------------------------
function isTermLike(s) {
  if (s.length < 2 || s.length > 70) return false;
  if (/[.!?;]$/.test(s)) return false;
  if (!/[A-Za-z]/.test(s)) return false; // must contain at least one letter
  const words = s.split(/\s+/);
  if (words.length > 6) return false;
  // strip trailing parentheticals like "(Legacy)" / "(Now)" for the casing test
  const cleanWords = words.map(w => w.replace(/\(.*\)\s*$/, '')).filter(Boolean);
  if (cleanWords.length === 0) return false;
  if (/^[A-Z][A-Z0-9&/]{1,12}$/.test(s.replace(/\s+/g, '').replace(/\(.*\)/g, ''))) return true;
  const significant = cleanWords.filter(w => !/^(a|an|the|of|and|for|to|in|on|with|by|is|are|as|at|or|from|that|this)$/i.test(w));
  if (significant.length === 0) return false;
  return significant.every(w => /^[A-Z0-9]/.test(w));
}

function isStructural(term) {
  if (/^(Module\s*(Title|Objective|Objectives)|Topic\s*(Title|Objective)|Learning\s*(Objective|Objectives)|Slide\s*\d+|Page\s*\d+)\b/i.test(term)) return true;
  if (/\bSummary\s*$/i.test(term)) return true;
  if (/^(Overview|Summary|Introduction|Conclusion|References|Key\s*Terms|New\s*Terms\s*(and\s*Commands)?|Objectives|Contents|Preface|Glossary)$/i.test(term)) return true;
  return false;
}

// Generic / structural words and table labels that should never become a term.
const STOP_TERMS = new Set([
  'general', 'description', 'management', 'security', 'services', 'restart', 'shutdown', 'hibernate',
  'networking', 'backup', 'restore', 'backup/restore', 'overview', 'introduction', 'summary', 'conclusion',
  'references', 'reference', 'notes', 'note', 'example', 'examples', 'default', 'defaults', 'options',
  'settings', 'configuration', 'features', 'benefits', 'types', 'table', 'figure', 'module', 'chapter',
  'topic', 'week', 'lesson', 'objective', 'objectives', 'title', 'terms', 'commands', 'slide', 'page',
  'information', 'details', 'additional', 'related', 'important', 'common', 'basic', 'advanced',
  'practice', 'lab', 'activity', 'none', 'all', 'other', 'various', 'following', 'below', 'above',
  'about', 'purpose', 'role', 'function', 'functions', 'advantage', 'advantages', 'disadvantage',
  'disadvantages', 'benefit', 'benefits', 'key', 'value', 'values', 'data', 'process', 'processes',
  'degrees', 'internships', 'certification', 'certifications', 'job', 'jobs', 'career', 'experience',
  'skills', 'skill', 'education', 'training', 'resources', 'requirements', 'steps', 'step', 'methods',
  'method', 'techniques', 'technique', 'tools', 'tool', 'limitations', 'considerations', 'differences',
  'comparison', 'name', 'term', 'meaning', 'definition', 'definitions', 'categories', 'characteristics',
  'properties', 'components', 'elements', 'aspects', 'factors', 'criteria', 'uses', 'use', 'goal',
  'goals', 'aims', 'summary of', 'key terms', 'new terms', 'what did i learn', 'check your understanding',
  'what will i learn', 'table of contents', 'what you will learn', 'learning objectives', 'module objectives',
  'lab', 'activities', 'answer', 'answers', 'question', 'questions', 'example answer',
  'eg', 'it', 'ie', 'vs', 'etc', 'etc.',
  'protocol', 'host', 'server', 'client', 'attacks', 'scripts', 'figure', 'header', 'field',
  'port', 'ports', 'interface', 'interfaces', 'packets', 'packet', 'frames', 'frame',
  'segments', 'segment', 'address', 'addresses', 'device', 'devices', 'network', 'networks',
  'wireless devices', 'file services',
]);

function isStopTerm(s) {
  if (!s) return false;
  // check against the raw string first (before punctuation is stripped)
  if (/\(contd?\.?\)\s*$/i.test(s) || /cont…/i.test(s)) return true;
  if (/\bnone\s*$/i.test(s)) return true;
  if (/\bbits?\s*$/i.test(s)) return true;
  // broken fragments / table & UI artifacts
  if (s.includes(')') && !s.includes('(')) return true;   // "IPv4)", "System)"
  if (/->|=>/.test(s)) return true;                        // "Sniff->Unified Sniffing"
  if (/\|/.test(s)) return true;                           // "Open|filtered"
  if (/\(\s*\d+\s*\)\s*$/.test(s)) return true;            // "Time Exceeded (11)"
  if (/\(seq\s*=/i.test(s)) return true;                   // "Segment 1 (seq=1000)"
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(s)) return true; // IP addresses
  if (/^figure\s*\d/i.test(s)) return true;                // "Figure 6-5"
  if (/\b[eE]g\.?\s*$/.test(s)) return true;               // "WLANs. Eg"
  const t = s.toLowerCase().replace(/[^a-z0-9&/ -]/g, '').trim();
  if (!t) return false;
  if (STOP_TERMS.has(t)) return true;
  if (/^\d+$/.test(t)) return true;
  return false;
}

function isBadTerm(s) {
  if (isStructural(s) || isStopTerm(s)) return true;
  if (/:$/.test(s)) return true;
  return false;
}

// Canonical full names for acronyms that are commonly mis-expanded by the
// extractor (comma-separated names, hyphenated names, or source typos).
// Ambiguous acronyms (ESP, DAD, MAC, RA, DAC, SA…) are deliberately omitted.
const ACRONYM_OVERRIDES = {
  SOAR: 'Security Orchestration, Automation, and Response',
  TTP: 'Tactics, Techniques, and Procedures',
  AAA: 'Authentication, Authorization, and Accounting',
  MTTD: 'Mean Time to Detect',
  MTTR: 'Mean Time to Respond',
  MTTC: 'Mean Time to Contain',
  UEFI: 'Unified Extensible Firmware Interface',
  RDP: 'Remote Desktop Protocol',
  SIEM: 'Security Information and Event Management',
  HIPAA: 'Health Insurance Portability and Accountability Act',
  BIOS: 'Basic Input/Output System',
  GIAC: 'Global Information Assurance Certification',
  RADIUS: 'Remote Authentication Dial-In User Service',
  LDAP: 'Lightweight Directory Access Protocol',
  RBAC: 'Role-Based Access Control',
  RTO: 'Recovery Time Objective',
  RPO: 'Recovery Point Objective',
  NIST: 'National Institute of Standards and Technology',
  SDLC: 'Software Development Life Cycle',
  'TF-IDF': 'Term Frequency-Inverse Document Frequency',
  IKE: 'Internet Key Exchange',
  IPsec: 'Internet Protocol Security',
  HTTPS: 'Hypertext Transfer Protocol Secure',
  OWASP: 'Open Web Application Security Project',
  CVSS: 'Common Vulnerability Scoring System',
  CVE: 'Common Vulnerabilities and Exposures',
  XSS: 'Cross-Site Scripting',
  CSRF: 'Cross-Site Request Forgery',
  LFI: 'Local File Inclusion',
  RFI: 'Remote File Inclusion',
  MFA: 'Multi-Factor Authentication',
  '2FA': 'Two-Factor Authentication',
  KPI: 'Key Performance Indicator',
  SOC: 'Security Operations Center',
  NGFW: 'Next-Generation Firewall',
  DLP: 'Data Loss Prevention',
  MDM: 'Mobile Device Management',
  BYOD: 'Bring Your Own Device',
  PKI: 'Public Key Infrastructure',
  MFT: 'Master File Table',
  NTFS: 'New Technology File System',
  GUI: 'Graphical User Interface',
  CLI: 'Command-Line Interface',
  DOS: 'Disk Operating System',
  PII: 'Personally Identifiable Information',
  PHI: 'Protected Health Information',
  IoT: 'Internet of Things',
  API: 'Application Programming Interface',
  SLA: 'Service Level Agreement',
  RAID: 'Redundant Array of Independent Disks',
  UPS: 'Uninterruptible Power Supply',
  KNN: 'K-Nearest Neighbors',
  SOP: 'Standard Operating Procedure',
};

function extractKnowledge(blocks) {
  const flashcards = [];
  const seen = new Set();
  function addFlashcard(front, back, reverse = true) {
    if (!front || !back) return;
    front = front.trim(); back = back.trim();
    if (!front.length || !back.length) return;
    if (front.length > 200 || back.length > 500) return;
    if (front.toLowerCase() === back.toLowerCase()) return;
    if (isBadTerm(front) || isBadTerm(back)) return;
    // truncated definitions that end mid-list or mid-word
    if (/[,;]\s*$/.test(back) || /\b(and|or|of|the|a|an|to|with)\s*$/.test(back)) return;
    if (/:\s*$/.test(front) || /:\s*$/.test(back)) return;
    const key = front.toLowerCase() + '|||' + back.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    flashcards.push({ front, back });
    if (reverse && back.length <= 180) {
      const rk = back.toLowerCase() + '|||' + front.toLowerCase();
      if (!seen.has(rk)) { seen.add(rk); flashcards.push({ front: back, back: front, reverse: true }); }
    }
  }

  const allLines = [];
  for (const b of blocks) {
    if (b.type === 'bullets') for (const it of b.items) allLines.push(it);
    else if (b.type === 'p') allLines.push(b.text);
    else if (b.type === 'heading') allLines.push(b.text);
  }

  const standRe = /^(.{1,90}?)\s+(?:stands?\s+for|is\s+(?:an?\s+)?(?:abbreviation|acronym)\s+for|is\s+short\s+for|is\s+(?:also\s+)?known\s+as|is\s+referred\s+to\s+as|is\s+called|means?)\s+(.{3,250})$/i;
  for (const l of allLines) {
    const m = l.match(standRe);
    if (m && isTermLike(m[1])) addFlashcard(m[1], m[2]);
  }

  // "Full Name (ACRONYM)" expansions e.g. "Domain Name System (DNS)".
  // Handles hyphenated names ("Basic Input-Output System") and lowercase
  // connectors ("Health Insurance Portability and Accountability Act"),
  // and a lookbehind so we don't capture a trailing suffix like
  // "Output System" out of "Basic Input-Output System".
  const acronymRe = /(?<![A-Za-z0-9&/-])([A-Z][A-Za-z0-9&/-]*(?:\s+(?:[A-Z][A-Za-z0-9&/-]*|and|of|the|for|to|in|on|or|with|by)){1,6})\s+\(([A-Z][A-Z0-9&/-]{1,11})\)/g;
  for (const l of allLines) {
    let m;
    while ((m = acronymRe.exec(l))) {
      let full = m[1].trim().replace(/^(The|A|An)\s+/i, '');
      const acr = m[2];
      const canonical = ACRONYM_OVERRIDES[acr.toUpperCase()];
      if (canonical) full = canonical;
      if (acr.length >= 2 && full.length >= 4 && full.split(/\s+/).length >= 2
        && !/^(Explain|Describe|Understand|Identify|List|Define|Outline|Compare|Contrast)\b/i.test(full)
        && !isBadTerm(acr) && !isBadTerm(full)) {
        addFlashcard(acr, full);
      }
    }
  }

  // Mid-sentence "X stands for Y" / "X is known as Y" / "X is called Y"
  const inlineRe = /\b([A-Z][A-Za-z0-9&/ -]{1,50}?)\s+(?:stands?\s+for|is\s+(?:also\s+)?known\s+as|is\s+referred\s+to\s+as|is\s+called|is\s+(?:an?\s+)?(?:abbreviation|acronym)\s+for)\s+([^.!?]{2,200})/gi;
  for (const l of allLines) {
    let m;
    while ((m = inlineRe.exec(l))) {
      const term = m[1].trim();
      const def = m[2].trim();
      if (isTermLike(term) && def.length >= 2 && def.length <= 200) addFlashcard(term, def);
    }
  }

  const dashRe = /^(.{1,70}?)\s*[—–:]\s+(.{3,300})$/;
  const hyphenRe = /^(.{1,70}?)\s+-\s+(.{15,300})$/;
  for (const l of allLines) {
    let m = l.match(dashRe);
    if (!m) m = l.match(hyphenRe);
    if (m) {
      const term = m[1].trim(); const def = m[2].trim();
      if (isTermLike(term) && def.length >= 12 && def.length < 400) addFlashcard(term, def);
    }
  }

  for (let i = 0; i < blocks.length - 1; i++) {
    const b = blocks[i];
    const nb = blocks[i + 1];
    if (b.type !== 'heading') continue;
    const term = b.text;
    if (!isTermLike(term)) continue;
    if (isBadTerm(term)) continue;
    if (nb.type === 'p') {
      const def = nb.text;
      if (def.length >= 25 && def.length < 400 && !/[?]$/.test(def) && !isBadTerm(def)) addFlashcard(term, def);
    } else if (nb.type === 'bullets' && nb.items.length >= 1) {
      const def = nb.items[0];
      if (def.length >= 15 && def.length < 400 && !/[?]$/.test(def) && !isBadTerm(def)) addFlashcard(term, def);
    }
  }

  const terms = [];
  const termSet = new Set();
  for (const f of flashcards) {
    if (!f.reverse && isTermLike(f.front) && f.front.length <= 70 && !termSet.has(f.front.toLowerCase())) {
      termSet.add(f.front.toLowerCase());
      terms.push({ term: f.front, def: f.back });
    }
  }

  const quiz = [];
  const termPool = terms.map(t => t.term);
  function pickDistractors(correct, pool, count = 3) {
    const opts = new Set([correct]);
    const shuffled = pool.filter(p => !opts.has(p)).sort(() => Math.random() - 0.5);
    for (const p of shuffled) { if (opts.size >= count + 1) break; opts.add(p); }
    return [...opts].sort(() => Math.random() - 0.5);
  }

  for (const t of terms) {
    if (quiz.length >= 60) break;
    const tTerm = t.term, tDef = t.def;
    if (termPool.length >= 4) {
      const opts = pickDistractors(tTerm, termPool, 3);
      quiz.push({
        type: 'mcq',
        q: 'Which term best matches this description?',
        stem: `“${tDef}”`,
        options: opts,
        answer: opts.indexOf(tTerm),
        explanation: `${tTerm} — ${tDef}`,
      });
    }
    if (termPool.length >= 2) {
      const other = termPool.filter(x => x.toLowerCase() !== tTerm.toLowerCase());
      if (other.length) {
        const wrong = other[Math.floor(Math.random() * other.length)];
        const wrongDef = terms.find(x => x.term === wrong)?.def || '';
        if (wrongDef) {
          const useTrue = Math.random() > 0.5;
          quiz.push({
            type: 'tf',
            q: useTrue ? `True or False: ${tTerm} is defined as "${tDef}".` : `True or False: ${tTerm} is defined as "${wrongDef}".`,
            answer: useTrue,
            explanation: `${tTerm} — ${tDef}`,
          });
        }
      }
    }
    const clozeDef = tDef.replace(new RegExp(`\\b${tTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '_____');
    if (clozeDef !== tDef && clozeDef.includes('_____')) {
      quiz.push({
        type: 'cloze',
        q: 'Fill in the blank:',
        stem: clozeDef,
        answer: tTerm,
        options: termPool.length >= 4 ? pickDistractors(tTerm, termPool, 3) : null,
        explanation: `${tTerm} — ${tDef}`,
      });
    }
  }

  // Sort forward cards before reverse cards for a natural first pass
  flashcards.sort((a, b) => (a.reverse ? 1 : 0) - (b.reverse ? 1 : 0));
  return { flashcards, quiz };
}

// Stable string hash for ids (djb2)
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// ---------------------------------------------------------------------------
// Lesson enrichment: emoji, key takeaways, roadmap topics
// ---------------------------------------------------------------------------
const EMOJI_MAP = [
  [/crypt|encrypt|decrypt|hash|cipher|pki|certificate|signature/i, '🔐'],
  [/forensic|incident|evidence|chain of custody|response/i, '🕵️'],
  [/linux/i, '🐧'],
  [/window/i, '🪟'],
  [/malware|virus|threat|attack|exploit|social eng|phishing|hack|ransom|intrusion/i, '☠️'],
  [/ai\b|machine learn|neural|bayes|regression|knn|spam detect|generative|agentic|deep learn/i, '🤖'],
  [/wireless|wi-fi|wifi|wlan|radio|bluetooth/i, '📡'],
  [/dns|dhcp|http|web|url|email|smtp|domain/i, '🔗'],
  [/cloud/i, '☁️'],
  [/database|sql/i, '🗄️'],
  [/monitor|alert|siem|log|snort|netflow|telemetry/i, '📊'],
  [/access control|authentication|aaa|password|identity/i, '🔑'],
  [/mobile|endpoint|host/i, '📱'],
  [/firewall|perimeter|vpn|dmz|ids|ips|defen|topolog/i, '🧱'],
  [/packet|capture|analysis|sniff|tcp|udp|ip\b|protocol|ethernet|switch|router|lan|wan|routing/i, '🌐'],
  [/risk|compliance|policy|audit|governance/i, '⚖️'],
  [/report|communication|document|presentation/i, '📝'],
];
function lessonEmoji(title, blocks) {
  const sample = (title + ' ' + blocks.slice(0, 40).map(b =>
    b.type === 'bullets' ? (b.items || []).join(' ') : (b.text || '')
  ).join(' ')).slice(0, 3000);
  for (const [re, e] of EMOJI_MAP) if (re.test(sample)) return e;
  return '📚';
}

function computeTakeaways(flashcards) {
  const seen = new Set();
  const out = [];
  for (const f of flashcards) {
    if (f.reverse) continue;
    if (f.front.length > 48) continue;
    if (f.back.length < 10 || f.back.length > 150) continue;
    const key = f.front.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ term: f.front, def: f.back });
    if (out.length >= 6) break;
  }
  return out;
}

function computeTopics(blocks) {
  const seen = new Set();
  const out = [];
  for (const b of blocks) {
    if (b.type !== 'heading') continue;
    const t = b.text;
    if (isStructural(t)) continue;
    if (/^(Module\s+\d+|Chapter\s+\d+|Week\s+\d+|Topic\s+[A-F])[:\s]/i.test(t)) continue;
    if (/cyberops\s+associate|v\d+(\.\d+)?$/i.test(t)) continue;
    if (t.length > 60 || /[:\-]$/.test(t)) continue;
    if (/^(Table|Figure|The following|Example)\b/i.test(t)) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 14) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const course = { version: 1, generated: new Date().toISOString(), modules: [] };

  for (const m of MODULES) {
    const dir = path.join(ROOT, m.dir);
    const files = fs.readdirSync(dir).filter(f => /\.(pdf|pptx)$/i.test(f));
    const metas = files.map(f => ({ file: f, meta: parseFileMeta(m.id, f) }));
    metas.sort((a, b) => {
      if (a.meta.sortKey !== b.meta.sortKey) return a.meta.sortKey < b.meta.sortKey ? -1 : 1;
      return a.file.localeCompare(b.file);
    });

    const lessons = [];
    for (let i = 0; i < metas.length; i++) {
      const { file, meta } = metas[i];
      const fp = path.join(dir, file);
      const ext = path.extname(file).toLowerCase();
      const rawText = ext === '.pdf' ? await extractPdf(fp) : await extractPptx(fp);
      const lines = cleanLines(rawText);
      const blocks = parseBlocks(lines);
      const { flashcards, quiz } = extractKnowledge(blocks);
      const lessonId = `${m.id}-${i + 1}`;
      flashcards.forEach(f => { f.id = hashStr(`${m.id}|${meta.title}|${f.front}|${f.back}`); });
      quiz.forEach((q, qi) => { q.id = hashStr(`${m.id}|${meta.title}|q${qi}|${q.q}|${q.stem || ''}`); });
      lessons.push({
        id: lessonId,
        order: i + 1,
        title: meta.title,
        emoji: lessonEmoji(meta.title, blocks),
        file,
        blocks, flashcards, quiz,
        takeaways: computeTakeaways(flashcards),
        topics: computeTopics(blocks),
      });
      console.log(`${m.id}/${i + 1}  ${meta.title.slice(0, 60).padEnd(62)} fc=${flashcards.length} quiz=${quiz.length}`);
    }
    course.modules.push({ ...m, lessons });
  }

  const outDir = path.join(ROOT, 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const js = `window.COURSE_DATA = ${JSON.stringify(course)};\n`;
  fs.writeFileSync(path.join(outDir, 'data.js'), js, 'utf8');
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(course, null, 2), 'utf8');

  const totalFc = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.flashcards.length, 0), 0);
  const totalQuiz = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.quiz.length, 0), 0);
  console.log(`\nWrote public/data.js (${(js.length / 1024 / 1024).toFixed(2)} MB) + data.json`);
  console.log(`Total flashcards: ${totalFc}, Total quiz questions: ${totalQuiz}`);
})();
