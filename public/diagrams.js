/* =====================================================================
   CyberLearn — Visual diagram library (hand-built SVG)
   Each diagram is keyed to modules/topics via `keywords`.
   ===================================================================== */

window.DIAGRAMS = [
  {
    id: 'osi-model',
    title: 'OSI 7-Layer Model',
    module: 'naf',
    keywords: ['osi', 'layer', 'application layer', 'presentation', 'session', 'transport', 'network', 'data link', 'physical', 'pdu', 'protocol data unit'],
    description: 'The Open Systems Interconnection model divides network communication into seven logical layers.',
    svg: `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.lbl{fill:#e6edf7;font-size:13px}.ex{fill:#9aa9c2;font-size:11px}.n{fill:#0b1120;font-weight:700;font-size:12px}</style>
      ${[['7','Application','HTTP, DNS, SMTP','#38bdf8',16],['6','Presentation','TLS/SSL, JPEG, ASCII','#22d3ee',60],['5','Session','NetBIOS, RPC','#2dd4bf',104],['4','Transport','TCP, UDP','#34d399',148],['3','Network','IP, ICMP, IPsec','#a3e635',192],['2','Data Link','Ethernet, ARP, MAC','#fbbf24',236],['1','Physical','Cables, bits, signals','#fb923c',280]].map(([n,name,ex,c,y])=>`
      <rect x="60" y="${y}" width="360" height="40" rx="7" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      <circle cx="86" cy="${y+20}" r="11" fill="${c}"/><text x="86" y="${y+24}" text-anchor="middle" class="n">${n}</text>
      <text x="106" y="${y+16}" class="lbl" font-weight="600">${name}</text>
      <text x="106" y="${y+30}" class="ex">${ex}</text>`).join('')}
      <text x="470" y="60" fill="#9aa9c2" font-size="12">Each layer serves the</text>
      <text x="470" y="78" fill="#9aa9c2" font-size="12">one above it and is</text>
      <text x="470" y="96" fill="#9aa9c2" font-size="12">served by the one below.</text>
      <rect x="460" y="130" width="150" height="110" rx="8" fill="#111a2b" stroke="#22314f"/>
      <text x="535" y="152" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="13">PDU names</text>
      ${[['Data','#38bdf8',170],['Segments','#34d399',188],['Packets','#a3e635',206],['Frames','#fbbf24',224],['Bits','#fb923c',242]].map(([t,c,y])=>`<text x="535" y="${y}" text-anchor="middle" fill="${c}" font-size="12">${t}</text>`).join('')}
      <text x="60" y="360" fill="#6b7a94" font-size="11">Host A → switches/routers → Host B</text>
    </svg>`
  },
  {
    id: 'tcpip-vs-osi',
    title: 'TCP/IP vs OSI Model',
    module: 'naf',
    keywords: ['tcp/ip', 'osi', 'dod', 'internet protocol suite'],
    description: 'The four-layer TCP/IP (DoD) model maps onto the seven-layer OSI model.',
    svg: `<svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12.5px}</style>
      <text x="150" y="28" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="14">OSI (7 layers)</text>
      <text x="490" y="28" text-anchor="middle" fill="#34d399" font-weight="700" font-size="14">TCP/IP (4 layers)</text>
      ${[['Application','#38bdf8',50,['Application','#34d399']],['Presentation','#22d3ee',92,null],['Session','#2dd4bf',134,null],['Transport','#34d399',176,['Transport','#34d399']],['Network','#a3e635',218,['Internet','#a3e635']],['Data Link','#fbbf24',260,['Network Access','#fbbf24']],['Physical','#fb923c',302,null]].map(([name,c,y,right])=>`
        <rect x="60" y="${y}" width="180" height="34" rx="6" fill="${c}" opacity="0.16" stroke="${c}"/>
        <text x="150" y="${y+22}" text-anchor="middle" class="t">${name}</text>`).join('')}
      <rect x="360" y="50" width="200" height="86" rx="8" fill="#34d399" opacity="0.14" stroke="#34d399"/>
      <text x="460" y="74" text-anchor="middle" fill="#34d399" font-weight="600">Application</text>
      <text x="460" y="94" text-anchor="middle" fill="#9aa9c2" font-size="11">(HTTP, DNS, SMTP)</text>
      <text x="460" y="114" text-anchor="middle" fill="#9aa9c2" font-size="11">OSI 7 + 6 + 5</text>
      <rect x="360" y="176" width="200" height="34" rx="6" fill="#34d399" opacity="0.16" stroke="#34d399"/>
      <text x="460" y="198" text-anchor="middle" class="t">Transport</text>
      <rect x="360" y="218" width="200" height="34" rx="6" fill="#a3e635" opacity="0.16" stroke="#a3e635"/>
      <text x="460" y="240" text-anchor="middle" class="t">Internet</text>
      <rect x="360" y="260" width="200" height="76" rx="8" fill="#fbbf24" opacity="0.14" stroke="#fbbf24"/>
      <text x="460" y="284" text-anchor="middle" fill="#fbbf24" font-weight="600">Network Access</text>
      <text x="460" y="304" text-anchor="middle" fill="#9aa9c2" font-size="11">(OSI 2 + 1)</text>
      <text x="320" y="360" text-anchor="middle" fill="#6b7a94" font-size="11">Cisco CyberOps references both models — know the mapping.</text>
    </svg>`
  },
  {
    id: 'tcp-handshake',
    title: 'TCP Three-Way Handshake',
    module: 'cso',
    keywords: ['tcp', 'handshake', 'syn', 'ack', 'connection', 'flags', 'transport layer'],
    description: 'TCP establishes a reliable session with a SYN → SYN-ACK → ACK exchange.',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#38bdf8"/></marker></defs>
      <style>.t{fill:#e6edf7;font-size:12.5px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="60" y="120" width="150" height="80" rx="10" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/>
      <text x="135" y="155" text-anchor="middle" class="c">Client</text><text x="135" y="173" text-anchor="middle" fill="#9aa9c2" font-size="11">ephemeral port</text>
      <rect x="430" y="120" width="150" height="80" rx="10" fill="#34d399" opacity="0.16" stroke="#34d399"/>
      <text x="505" y="155" text-anchor="middle" class="c">Server</text><text x="505" y="173" text-anchor="middle" fill="#9aa9c2" font-size="11">listening port 80</text>
      ${[['1. SYN',60,'seq = x','#38bdf8',8],['2. SYN-ACK',130,'seq = y, ack = x+1','#a3e635',48],['3. ACK',200,'ack = y+1','#34d399',88]].map(([lbl,y,detail,c,dy],i)=>{
        const dir = i===1 ? -1 : 1;
        const x1 = i===1 ? 505 : 135, x2 = i===1 ? 135 : 505;
        return `<line x1="${x1}" y1="${y+dy}" x2="${x2}" y2="${y+dy}" stroke="${c}" stroke-width="2" marker-end="url(#ah)"/>
        <text x="320" y="${y+dy-4}" text-anchor="middle" fill="${c}" font-weight="700" font-size="12.5">${lbl}</text>
        <text x="320" y="${y+dy+14}" text-anchor="middle" class="t">${detail}</text>`;}).join('')}
      <text x="320" y="285" text-anchor="middle" fill="#6b7a94" font-size="11">Once complete, the connection is established and data can flow in both directions.</text>
    </svg>`
  },
  {
    id: 'cia-triad',
    title: 'The CIA Triad',
    module: 'firewall',
    keywords: ['cia', 'confidentiality', 'integrity', 'availability', 'dad'],
    description: 'The three pillars of information security: Confidentiality, Integrity, Availability.',
    svg: `<svg viewBox="0 0 640 350" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#9aa9c2;font-size:11.5px}</style>
      <polygon points="320,65 90,245 550,245" fill="none" stroke="#22314f" stroke-width="2"/>
      <circle cx="320" cy="115" r="32" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="2"/>
      <text x="320" y="122" text-anchor="middle" fill="#38bdf8" font-size="17" font-weight="700">C</text>
      <text x="320" y="40" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="15">Confidentiality</text>
      <text x="320" y="172" text-anchor="middle" class="t">Only authorised parties can read data</text>
      <circle cx="150" cy="245" r="32" fill="#34d399" opacity="0.18" stroke="#34d399" stroke-width="2"/>
      <text x="150" y="252" text-anchor="middle" fill="#34d399" font-size="17" font-weight="700">I</text>
      <text x="150" y="302" text-anchor="middle" fill="#34d399" font-weight="700" font-size="14">Integrity</text>
      <text x="150" y="319" text-anchor="middle" class="t">Data is not altered in transit</text>
      <circle cx="490" cy="245" r="32" fill="#fb923c" opacity="0.18" stroke="#fb923c" stroke-width="2"/>
      <text x="490" y="252" text-anchor="middle" fill="#fb923c" font-size="17" font-weight="700">A</text>
      <text x="490" y="302" text-anchor="middle" fill="#fb923c" font-weight="700" font-size="14">Availability</text>
      <text x="490" y="319" text-anchor="middle" class="t">Services accessible when needed</text>
      <text x="320" y="341" text-anchor="middle" fill="#6b7a94" font-size="11">Opposite of CIA: DAD — Disclosure, Alteration &amp; Denial</text>
    </svg>`
  },
  {
    id: 'symmetric-asymmetric',
    title: 'Symmetric vs Asymmetric Encryption',
    module: 'cso',
    keywords: ['symmetric', 'asymmetric', 'encryption', 'cryptography', 'key', 'aes', 'rsa', 'public key', 'private key'],
    description: 'Symmetric uses one shared key; asymmetric uses a public/private key pair.',
    svg: `<svg viewBox="0 0 640 340" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="20" width="280" height="300" rx="12" fill="#111a2b" stroke="#22314f"/>
      <text x="170" y="48" text-anchor="middle" fill="#34d399" font-weight="700" font-size="14">Symmetric (shared key)</text>
      <rect x="60" y="80" width="90" height="46" rx="7" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="105" y="108" text-anchor="middle" class="c">Plaintext</text>
      <rect x="60" y="180" width="90" height="46" rx="7" fill="#a3e635" opacity="0.16" stroke="#a3e635"/><text x="105" y="208" text-anchor="middle" class="c">Ciphertext</text>
      <rect x="190" y="80" width="90" height="46" rx="7" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="235" y="108" text-anchor="middle" class="c">Plaintext</text>
      <path d="M150 103 H190 M235 126 V180 M235 226 H150" stroke="#34d399" stroke-width="2" fill="none" marker-end="none"/>
      <text x="170" y="156" text-anchor="middle" fill="#fbbf24" font-size="11">🔑 one shared key</text>
      <text x="170" y="280" text-anchor="middle" class="t">Fast · good for bulk data</text>
      <text x="170" y="298" text-anchor="middle" class="t">e.g. AES, 3DES</text>
      <rect x="330" y="20" width="280" height="300" rx="12" fill="#111a2b" stroke="#22314f"/>
      <text x="470" y="48" text-anchor="middle" fill="#a78bfa" font-weight="700" font-size="14">Asymmetric (key pair)</text>
      <rect x="360" y="80" width="90" height="46" rx="7" fill="#a78bfa" opacity="0.16" stroke="#a78bfa"/><text x="405" y="108" text-anchor="middle" class="c">Plaintext</text>
      <rect x="360" y="180" width="90" height="46" rx="7" fill="#a3e635" opacity="0.16" stroke="#a3e635"/><text x="405" y="208" text-anchor="middle" class="c">Ciphertext</text>
      <rect x="490" y="80" width="90" height="46" rx="7" fill="#a78bfa" opacity="0.16" stroke="#a78bfa"/><text x="535" y="108" text-anchor="middle" class="c">Plaintext</text>
      <path d="M450 103 H490 M535 126 V180 M535 226 H450" stroke="#a78bfa" stroke-width="2" fill="none"/>
      <text x="470" y="152" text-anchor="middle" fill="#fbbf24" font-size="11">🔑 public (encrypt)</text>
      <text x="470" y="168" text-anchor="middle" fill="#fbbf24" font-size="11">🔐 private (decrypt)</text>
      <text x="470" y="280" text-anchor="middle" class="t">Slower · used for key exchange</text>
      <text x="470" y="298" text-anchor="middle" class="t">e.g. RSA, ECC, DH</text>
    </svg>`
  },
  {
    id: 'pki',
    title: 'Public Key Infrastructure (PKI)',
    module: 'cso',
    keywords: ['pki', 'certificate', 'certificate authority', 'ca', 'registration authority', 'digital certificate', 'trust'],
    description: 'A Certificate Authority vouches for the ownership of public keys.',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="255" y="40" width="130" height="66" rx="10" fill="#a78bfa" opacity="0.18" stroke="#a78bfa" stroke-width="2"/>
      <text x="320" y="68" text-anchor="middle" class="c">Certificate</text><text x="320" y="84" text-anchor="middle" class="c">Authority (CA)</text>
      <text x="320" y="100" text-anchor="middle" fill="#9aa9c2" font-size="11">trusted root</text>
      <rect x="80" y="200" width="130" height="56" rx="9" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="145" y="233" text-anchor="middle" class="c">Alice</text>
      <rect x="430" y="200" width="130" height="56" rx="9" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="495" y="233" text-anchor="middle" class="c">Bob</text>
      <line x1="290" y1="106" x2="165" y2="200" stroke="#a78bfa" stroke-width="2" marker-end="none"/>
      <line x1="350" y1="106" x2="475" y2="200" stroke="#a78bfa" stroke-width="2"/>
      <text x="200" y="160" text-anchor="middle" fill="#fbbf24" font-size="11">issues cert</text>
      <text x="440" y="160" text-anchor="middle" fill="#fbbf24" font-size="11">issues cert</text>
      <line x1="210" y1="200" x2="430" y2="200" stroke="#e6edf7" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="320" y="192" text-anchor="middle" fill="#9aa9c2" font-size="11">exchange certificates → establish trust</text>
      <text x="320" y="278" text-anchor="middle" fill="#6b7a94" font-size="11">The CA's digital signature lets parties verify a public key's owner.</text>
    </svg>`
  },
  {
    id: 'network-topologies',
    title: 'Network Topologies',
    module: 'firewall',
    keywords: ['topology', 'star', 'bus', 'ring', 'mesh', 'topologies'],
    description: 'Common physical/logical layouts: star, bus, ring, and mesh.',
    svg: `<svg viewBox="0 0 640 350" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:13px}</style>
      ${[['Star','#38bdf8',15,15],['Bus','#fbbf24',325,15],['Ring','#34d399',15,185],['Mesh','#fb923c',325,185]].map(([n,c,x,y])=>`
        <rect x="${x}" y="${y}" width="300" height="150" rx="10" fill="#111a2b" stroke="#22314f"/>
        <text x="${x+150}" y="${y+24}" text-anchor="middle" fill="${c}" font-weight="700" font-size="13.5">${n}</text>`).join('')}
      <!-- Star -->
      <g stroke="#38bdf8" stroke-width="2">${[[165,65],[205,105],[165,145],[125,105]].map(([x,y])=>`<line x1="165" y1="105" x2="${x}" y2="${y}"/>`).join('')}</g>
      ${[[165,105],[165,65],[205,105],[165,145],[125,105]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#38bdf8"/>`).join('')}
      <!-- Bus -->
      <line x1="425" y1="105" x2="525" y2="105" stroke="#fbbf24" stroke-width="2"/>
      <line x1="455" y1="105" x2="455" y2="125" stroke="#fbbf24" stroke-width="2"/>
      ${[[425,105],[455,105],[485,105],[515,105],[455,125]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fbbf24"/>`).join('')}
      <!-- Ring -->
      <circle cx="165" cy="265" r="30" fill="none" stroke="#34d399" stroke-width="2"/>
      ${[[165,235],[195,265],[165,295],[135,265]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#34d399"/>`).join('')}
      <!-- Mesh -->
      <g stroke="#fb923c" stroke-width="1.5"><line x1="445" y1="245" x2="505" y2="245"/><line x1="445" y1="245" x2="445" y2="285"/><line x1="445" y1="245" x2="505" y2="285"/><line x1="505" y1="245" x2="445" y2="285"/><line x1="505" y1="245" x2="505" y2="285"/><line x1="445" y1="285" x2="505" y2="285"/></g>
      ${[[445,245],[505,245],[445,285],[505,285]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fb923c"/>`).join('')}
    </svg>`
  },
  {
    id: 'ids-vs-ips',
    title: 'IDS vs IPS',
    module: 'firewall',
    keywords: ['ids', 'ips', 'intrusion detection', 'intrusion prevention', 'signature', 'anomaly'],
    description: 'IDS detects (off to the side); IPS detects and blocks (inline).',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="60" y="30" width="120" height="50" rx="8" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="120" y="59" text-anchor="middle" class="c">Internet</text>
      <rect x="470" y="30" width="120" height="50" rx="8" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="530" y="59" text-anchor="middle" class="c">Internal LAN</text>
      <line x1="180" y1="55" x2="470" y2="55" stroke="#e6edf7" stroke-width="2"/>
      <rect x="240" y="32" width="90" height="46" rx="8" fill="#fbbf24" opacity="0.2" stroke="#fbbf24"/><text x="285" y="59" text-anchor="middle" class="c">IPS</text>
      <rect x="290" y="150" width="120" height="46" rx="8" fill="#f87171" opacity="0.16" stroke="#f87171"/><text x="350" y="177" text-anchor="middle" class="c">IDS (copy)</text>
      <line x1="285" y1="78" x2="350" y2="150" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="350" y="210" text-anchor="middle" fill="#9aa9c2" font-size="11">IDS: detects &amp; alerts only</text>
      <text x="285" y="100" text-anchor="middle" fill="#fbbf24" font-size="11">IPS: inline — blocks traffic</text>
      <text x="320" y="270" text-anchor="middle" fill="#6b7a94" font-size="11">Both use signatures and/or anomaly detection.</text>
    </svg>`
  },
  {
    id: 'firewall-dmz',
    title: 'Perimeter Defence & DMZ',
    module: 'firewall',
    keywords: ['firewall', 'dmz', 'demilitarized', 'perimeter', 'screened subnet', 'inside', 'outside'],
    description: 'Firewalls separate the untrusted outside from the inside network, with a screened DMZ for public servers.',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="30" width="120" height="240" rx="10" fill="#f87171" opacity="0.12" stroke="#f87171"/><text x="90" y="160" text-anchor="middle" fill="#f87171" font-weight="700">Internet</text><text x="90" y="178" text-anchor="middle" fill="#9aa9c2" font-size="11">(untrusted)</text>
      <rect x="330" y="30" width="120" height="240" rx="10" fill="#fbbf24" opacity="0.14" stroke="#fbbf24"/><text x="390" y="150" text-anchor="middle" fill="#fbbf24" font-weight="700">DMZ</text><text x="390" y="168" text-anchor="middle" fill="#9aa9c2" font-size="11">web / DNS /</text><text x="390" y="183" text-anchor="middle" fill="#9aa9c2" font-size="11">mail servers</text>
      <rect x="500" y="30" width="110" height="240" rx="10" fill="#34d399" opacity="0.14" stroke="#34d399"/><text x="555" y="150" text-anchor="middle" fill="#34d399" font-weight="700">Inside</text><text x="555" y="168" text-anchor="middle" fill="#9aa9c2" font-size="11">(trusted)</text>
      <rect x="175" y="105" width="36" height="90" rx="6" fill="#fb923c" opacity="0.3" stroke="#fb923c" stroke-width="2"/><text x="193" y="160" text-anchor="middle" fill="#fb923c" font-weight="700" font-size="11" transform="rotate(-90 193 160)">Firewall</text>
      <rect x="470" y="105" width="34" height="90" rx="6" fill="#38bdf8" opacity="0.3" stroke="#38bdf8" stroke-width="2"/><text x="487" y="160" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="11" transform="rotate(-90 487 160)">Firewall</text>
      <line x1="150" y1="150" x2="175" y2="150" stroke="#e6edf7" stroke-width="2"/>
      <line x1="211" y1="150" x2="330" y2="150" stroke="#e6edf7" stroke-width="2"/>
      <line x1="450" y1="150" x2="470" y2="150" stroke="#e6edf7" stroke-width="2"/>
      <line x1="504" y1="150" x2="500" y2="150" stroke="#e6edf7" stroke-width="2"/>
      <text x="320" y="292" text-anchor="middle" fill="#6b7a94" font-size="11">Public services sit in the DMZ; internal systems stay behind the second firewall.</text>
    </svg>`
  },
  {
    id: 'vpn-tunnel',
    title: 'VPN Tunnel',
    module: 'firewall',
    keywords: ['vpn', 'tunnel', 'ipsec', 'encrypted', 'site to site', 'remote access'],
    description: 'A VPN creates an encrypted tunnel across an untrusted network (e.g. the Internet).',
    svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="120" width="130" height="70" rx="10" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="95" y="150" text-anchor="middle" class="c">Site A</text><text x="95" y="168" text-anchor="middle" fill="#9aa9c2" font-size="11">10.1.0.0/24</text>
      <rect x="480" y="120" width="130" height="70" rx="10" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="545" y="150" text-anchor="middle" class="c">Site B</text><text x="545" y="168" text-anchor="middle" fill="#9aa9c2" font-size="11">10.2.0.0/24</text>
      <rect x="160" y="60" width="320" height="70" rx="12" fill="#f87171" opacity="0.1" stroke="#f87171" stroke-dasharray="6 4"/><text x="320" y="100" text-anchor="middle" fill="#f87171" font-size="12">Untrusted Internet</text>
      <path d="M160 155 C 260 120, 380 190, 480 155" fill="none" stroke="#a78bfa" stroke-width="5" opacity="0.35"/>
      <path d="M160 155 C 260 120, 380 190, 480 155" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="8 5"/>
      <text x="320" y="205" text-anchor="middle" fill="#a78bfa" font-weight="700" font-size="12">🔒 encrypted tunnel (IPsec / SSL)</text>
      <text x="320" y="250" text-anchor="middle" fill="#6b7a94" font-size="11">Packets are encapsulated and encrypted end-to-end.</text>
    </svg>`
  },
  {
    id: 'arp',
    title: 'ARP Request / Reply',
    module: 'cso',
    keywords: ['arp', 'address resolution', 'mac address', 'broadcast', 'ip to mac'],
    description: 'ARP resolves an IPv4 address to a MAC address using a broadcast request and unicast reply.',
    svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="40" y="100" width="120" height="60" rx="9" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="100" y="128" text-anchor="middle" class="c">Host A</text><text x="100" y="146" text-anchor="middle" fill="#9aa9c2" font-size="11">10.0.0.1</text>
      <rect x="240" y="100" width="120" height="60" rx="9" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="300" y="128" text-anchor="middle" class="c">Host B</text><text x="300" y="146" text-anchor="middle" fill="#9aa9c2" font-size="11">10.0.0.2</text>
      <rect x="440" y="100" width="120" height="60" rx="9" fill="#6b7a94" opacity="0.16" stroke="#6b7a94"/><text x="500" y="128" text-anchor="middle" class="c">Host C</text><text x="500" y="146" text-anchor="middle" fill="#9aa9c2" font-size="11">10.0.0.3</text>
      <line x1="100" y1="60" x2="500" y2="60" stroke="#e6edf7" stroke-width="2"/>
      <text x="300" y="48" text-anchor="middle" fill="#fbbf24" font-weight="700" font-size="12.5">1 · ARP request (broadcast): "Who has 10.0.0.2?"</text>
      <line x1="300" y1="160" x2="100" y2="100" stroke="#34d399" stroke-width="2"/>
      <text x="200" y="150" text-anchor="middle" fill="#34d399" font-weight="700" font-size="12.5">2 · ARP reply (unicast)</text>
      <text x="320" y="250" text-anchor="middle" fill="#6b7a94" font-size="11">A then caches the IP→MAC mapping in its ARP table.</text>
    </svg>`
  },
  {
    id: 'dns-resolution',
    title: 'DNS Resolution',
    module: 'naf',
    keywords: ['dns', 'domain name', 'resolver', 'recursive', 'root server', 'tld', 'authoritative', 'a record'],
    description: 'How a domain name is resolved to an IP address through the DNS hierarchy.',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:11.5px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="220" width="120" height="50" rx="9" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="90" y="243" text-anchor="middle" class="c">Client</text><text x="90" y="259" text-anchor="middle" fill="#9aa9c2" font-size="10">resolver</text>
      ${[['Root server',90,'#fbbf24'],['.com TLD',190,'#fb923c'],['Authoritative',290,'#34d399']].map(([n,x,c],i)=>`<rect x="${x}" y="70" width="130" height="46" rx="8" fill="${c}" opacity="0.16" stroke="${c}"/><text x="${x+65}" y="98" text-anchor="middle" class="c" fill="${c}">${n}</text>`).join('')}
      <path d="M90 220 L155 130 L355 116" stroke="#fbbf24" stroke-width="2" fill="none"/>
      <path d="M155 130 L220 116" stroke="#e6edf7" stroke-width="1.5" fill="none"/>
      <text x="120" y="180" text-anchor="middle" fill="#9aa9c2" font-size="10.5">1. query</text>
      <text x="330" y="140" text-anchor="middle" fill="#9aa9c2" font-size="10.5">2. iterates down the hierarchy</text>
      <text x="320" y="280" text-anchor="middle" fill="#6b7a94" font-size="11">Root → TLD → authoritative, then the answer is cached and returned.</text>
    </svg>`
  },
  {
    id: 'dhcp-dora',
    title: 'DHCP — The DORA Process',
    module: 'naf',
    keywords: ['dhcp', 'dora', 'discover', 'offer', 'request', 'acknowledge', 'ip address', 'lease'],
    description: 'A client obtains an IP address through Discover, Offer, Request, Acknowledge.',
    svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <defs><marker id="dh" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#38bdf8"/></marker></defs>
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="60" y="110" width="130" height="60" rx="9" fill="#38bdf8" opacity="0.16" stroke="#38bdf8"/><text x="125" y="145" text-anchor="middle" class="c">Client</text>
      <rect x="450" y="110" width="130" height="60" rx="9" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="515" y="145" text-anchor="middle" class="c">DHCP Server</text>
      ${[['D — Discover','broadcast',45,'#fbbf24'],['O — Offer','unicast (IP offered)',95,'#fb923c'],['R — Request','broadcast (accept)',145,'#a3e635'],['A — Acknowledge','unicast (confirmed)',195,'#34d399']].map(([lbl,sub,y,c],i)=>{
        const dir = i%2===0 ? 1 : -1; const x1 = i%2===0?125:515, x2=i%2===0?515:125;
        return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="2" marker-end="url(#dh)"/>
        <text x="320" y="${y-4}" text-anchor="middle" fill="${c}" font-weight="700" font-size="12.5">${lbl}</text>
        <text x="320" y="${y+13}" text-anchor="middle" class="t">${sub}</text>`;}).join('')}
      <text x="320" y="262" text-anchor="middle" fill="#6b7a94" font-size="11">DORA assigns an IP address, subnet mask, gateway and DNS for a lease period.</text>
    </svg>`
  },
  {
    id: 'nat',
    title: 'Network Address Translation (NAT)',
    module: 'naf',
    keywords: ['nat', 'pat', 'address translation', 'private address', 'public address', 'inside', 'outside'],
    description: 'NAT maps private internal addresses to public addresses (PAT maps many to one).',
    svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:12px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="30" width="150" height="220" rx="10" fill="#34d399" opacity="0.12" stroke="#34d399"/><text x="105" y="58" text-anchor="middle" fill="#34d399" font-weight="700">Inside (private)</text>
      ${[['192.168.1.10',90],['192.168.1.11',120],['192.168.1.12',150]].map(([ip,y])=>`<rect x="60" y="${y-16}" width="90" height="24" rx="5" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="105" y="${y+1}" text-anchor="middle" fill="#e6edf7" font-size="10.5">${ip}</text>`).join('')}
      <rect x="460" y="30" width="150" height="220" rx="10" fill="#f87171" opacity="0.12" stroke="#f87171"/><text x="535" y="58" text-anchor="middle" fill="#f87171" font-weight="700">Outside (public)</text>
      <rect x="490" y="90" width="90" height="24" rx="5" fill="#f87171" opacity="0.16" stroke="#f87171"/><text x="535" y="107" text-anchor="middle" fill="#e6edf7" font-size="10.5">203.0.113.5</text>
      <rect x="230" y="95" width="100" height="90" rx="9" fill="#fbbf24" opacity="0.2" stroke="#fbbf24" stroke-width="2"/><text x="280" y="135" text-anchor="middle" fill="#fbbf24" font-weight="700">NAT</text><text x="280" y="153" text-anchor="middle" fill="#9aa9c2" font-size="11">/ PAT</text>
      <line x1="180" y1="110" x2="230" y2="110" stroke="#e6edf7" stroke-width="2"/>
      <line x1="330" y1="140" x2="460" y2="140" stroke="#e6edf7" stroke-width="2"/>
      <text x="280" y="220" text-anchor="middle" fill="#6b7a94" font-size="11">PAT maps many private IPs to one public IP using ports.</text>
    </svg>`
  },
  {
    id: 'soc-flow',
    title: 'SOC Tier Alert Flow',
    module: 'cso',
    keywords: ['soc', 'tier 1', 'tier 2', 'tier 3', 'alert analyst', 'incident responder', 'threat hunter', 'ticketing'],
    description: 'Alerts escalate through SOC tiers from monitoring to deep investigation.',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:11.5px}.c{fill:#0b1120;font-weight:700}</style>
      ${[['Tier 1','Alert Analyst','monitor &amp; triage alerts','#38bdf8',40],['Tier 2','Incident Responder','deep investigation &amp; remediation','#34d399',210],['Tier 3','Threat Hunter','proactive hunting &amp; malware RE','#a78bfa',380]].map(([t,r,d,c,x])=>`
        <rect x="${x}" y="120" width="150" height="110" rx="10" fill="${c}" opacity="0.16" stroke="${c}"/>
        <text x="${x+75}" y="146" text-anchor="middle" fill="${c}" font-weight="700" font-size="13">${t}</text>
        <text x="${x+75}" y="166" text-anchor="middle" class="c">${r}</text>
        <text x="${x+75}" y="188" text-anchor="middle" class="t">${d}</text>`).join('')}
      <path d="M190 175 L210 175" stroke="#e6edf7" stroke-width="2"/><path d="M360 175 L380 175" stroke="#e6edf7" stroke-width="2"/>
      <text x="200" y="165" text-anchor="middle" fill="#fbbf24" font-size="11">escalate</text><text x="370" y="165" text-anchor="middle" fill="#fbbf24" font-size="11">escalate</text>
      <text x="115" y="265" text-anchor="middle" fill="#9aa9c2" font-size="11">ticketing system</text>
      <text x="320" y="60" text-anchor="middle" fill="#6b7a94" font-size="11">Alerts enter via SIEM / monitoring and are triaged by Tier 1.</text>
    </svg>`
  },
  {
    id: 'forensics-process',
    title: 'Digital Forensics Process',
    module: 'cso',
    keywords: ['forensics', 'incident', 'evidence', 'chain of custody', 'analysis', 'response', 'nist'],
    description: 'A structured approach to incident analysis and response (NIST-aligned).',
    svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:11px}.c{fill:#0b1120;font-weight:700}</style>
      ${[['1','Prepare','policies & tools','#38bdf8',40],['2','Detect','identify incident','#fbbf24',160],['3','Respond','contain &amp; eradicate','#fb923c',280],['4','Recover','restore services','#34d399',400],['5','Learn','post-incident review','#a78bfa',520]].map(([n,t,d,c,x])=>`
        <rect x="${x}" y="120" width="100" height="100" rx="12" fill="${c}" opacity="0.16" stroke="${c}"/>
        <circle cx="${x+50}" cy="146" r="13" fill="${c}"/><text x="${x+50}" y="151" text-anchor="middle" class="c">${n}</text>
        <text x="${x+50}" y="178" text-anchor="middle" fill="${c}" font-weight="700" font-size="12.5">${t}</text>
        <text x="${x+50}" y="198" text-anchor="middle" class="t">${d}</text>`).join('')}
      <path d="M140 170 L160 170 M260 170 L280 170 M380 170 L400 170 M500 170 L520 170" stroke="#e6edf7" stroke-width="2"/>
      <text x="320" y="262" text-anchor="middle" fill="#6b7a94" font-size="11">Preserve evidence and maintain chain of custody throughout.</text>
    </svg>`
  },
  {
    id: 'phishing-flow',
    title: 'Social Engineering / Phishing',
    module: 'aic',
    keywords: ['social engineering', 'phishing', 'spear phishing', 'pretexting', 'deepfake', 'ai'],
    description: 'Attackers manipulate people — and AI now automates and amplifies these attacks.',
    svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, sans-serif">
      <style>.t{fill:#e6edf7;font-size:11.5px}.c{fill:#0b1120;font-weight:700}</style>
      <rect x="30" y="100" width="120" height="70" rx="9" fill="#f87171" opacity="0.16" stroke="#f87171"/><text x="90" y="128" text-anchor="middle" class="c">Attacker</text><text x="90" y="146" text-anchor="middle" fill="#9aa9c2" font-size="10.5">(or AI agent)</text>
      <rect x="490" y="100" width="120" height="70" rx="9" fill="#34d399" opacity="0.16" stroke="#34d399"/><text x="550" y="128" text-anchor="middle" class="c">Target</text><text x="550" y="146" text-anchor="middle" fill="#9aa9c2" font-size="10.5">employee / user</text>
      <path d="M150 120 C 300 90, 340 170, 490 135" fill="none" stroke="#f87171" stroke-width="2"/>
      <text x="320" y="70" text-anchor="middle" fill="#f87171" font-weight="700" font-size="12">Deceptive message — urgency, authority, fear</text>
      <rect x="180" y="40" width="120" height="30" rx="6" fill="#fbbf24" opacity="0.16" stroke="#fbbf24"/><text x="240" y="60" text-anchor="middle" fill="#fbbf24" font-size="11">fake email / deepfake</text>
      <rect x="360" y="40" width="110" height="30" rx="6" fill="#a78bfa" opacity="0.16" stroke="#a78bfa"/><text x="415" y="60" text-anchor="middle" fill="#a78bfa" font-size="11">click link / transfer</text>
      <text x="320" y="240" text-anchor="middle" fill="#6b7a94" font-size="11">Defence: training, verification, MFA, and email filtering.</text>
    </svg>`
  },
];
