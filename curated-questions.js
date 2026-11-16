// Hand-crafted quiz questions for the Firewall labs and general diagram
// questions. These supplement the auto-generated questions and test command
// knowledge and network-diagram reasoning (real-exam style).
//
// Question shapes match the app's quiz format:
//   { type: 'mcq', q, stem?, options, answer(index), explanation }
//   { type: 'tf',  q, answer(bool), explanation }
//   { type: 'cloze', q, stem, answer(string), options?, explanation }

// ---- Lab titles (for Labs 1-3 the PDFs are image-based / scanned) ----
const LAB_TITLES = {
  1: 'Lab 1: Physical Setup & Connectivity',
  2: 'Lab 2: Firewall Fundamentals',
  3: 'Lab 3: Interface & Access Configuration',
  4: 'Lab 4: Firewall (ASA 5508) & ASDM',
  5: 'Lab 5: Firewall Management & DMZ',
  6: 'Lab 6: Remote Access VPN (Easy VPN)',
  7: 'Lab 7: Site-to-Site VPN (IPSec)',
};

// ---- Curated questions per lab ----
const CURATED_LAB_QUESTIONS = {
  4: [
    { type: 'mcq', q: 'What is the security level of the ASA outside interface?', options: ['0', '50', '100', '255'], answer: 0, explanation: 'The outside interface is always security level 0 (least secure).' },
    { type: 'mcq', q: 'What is the security level of the ASA inside interface?', options: ['0', '50', '100', '255'], answer: 2, explanation: 'The inside interface is always security level 100 (most secure).' },
    { type: 'mcq', q: 'In the Lab 4 network, which GigabitEthernet interface is the DMZ?', options: ['gi 1/1', 'gi 1/2', 'gi 1/3', 'gi 1/4'], answer: 3, explanation: 'gi 1/4 is the DMZ interface (web server network, 10.24.x).' },
    { type: 'mcq', q: 'Which interface is used for ASDM (GUI) management of the ASA?', options: ['gi 1/1 (outside)', 'gi 1/2 (MGMT)', 'gi 1/3 (inside)', 'gi 1/4 (DMZ)'], answer: 1, explanation: 'ASDM is accessed via the MGMT interface, GigabitEthernet 1/2.' },
    { type: 'mcq', q: 'What is the default IP address of the ASA management (gi 1/2) interface?', options: ['192.168.1.1', '10.23.x.11', '10.24.x.100', '10.25.x.100'], answer: 0, explanation: 'gi 1/2 (MGMT) is 192.168.1.1 by default.' },
    { type: 'mcq', q: 'Which command do you use to check whether the ASDM software is installed on the ASA?', options: ['show version', 'dir', 'ipconfig', 'show flash'], answer: 1, explanation: 'The `dir` command lists flash contents so you can see if ASDM is installed.' },
    { type: 'mcq', q: 'What does the `dir` command do on an ASA?', options: ['Lists files in flash memory', 'Shows routing table', 'Displays interface status', 'Reboots the appliance'], answer: 0, explanation: '`dir` lists files stored in flash, e.g. the ASDM image.' },
    { type: 'mcq', q: 'In Lab 4, which PC obtains its IP address automatically via DHCP?', options: ['PC1', 'PC2', 'PC3', 'PC4'], answer: 1, explanation: 'PC2 uses DHCP so it can reach the ASA and run ASDM.' },
    { type: 'mcq', q: 'PC2 should obtain an IP address in which range?', options: ['10.23.x.x', '10.24.x.x', '192.168.1.2 – 192.168.1.254', '10.25.x.x'], answer: 2, explanation: 'PC2 gets a DHCP address from the 192.168.1.0/24 MGMT network.' },
    { type: 'mcq', q: 'Which PC is the web server (connected to the DMZ) in Lab 4?', options: ['PC1', 'PC2', 'PC3', 'PC4'], answer: 3, explanation: 'PC4 is the web server on the DMZ (10.24.x).' },
    { type: 'mcq', q: 'ASDM is a _____ interface for the ASA.', options: ['command-line', 'graphical (GUI)', 'API', 'console-only'], answer: 1, explanation: 'ASDM is a web-based graphical interface.' },
    { type: 'mcq', q: 'Which license is required before you can use ASDM?', options: ['DES or 3DES-AES', 'AnyConnect', 'IPS', 'Base only'], answer: 0, explanation: 'ASDM requires a DES or 3DES-AES license.' },
    { type: 'mcq', q: 'What must be enabled in the web browser to run ASDM?', options: ['Cookies only', 'Java and JavaScript', 'Flash', 'Pop-ups'], answer: 1, explanation: 'Java and JavaScript must be enabled.' },
    { type: 'tf', q: 'The ASA CLI can be accessed via console, Telnet, or SSH.', answer: true, explanation: 'The CLI is reachable over console, Telnet, and SSH.' },
    { type: 'mcq', q: 'In Lab 4, what does a solid green LINK LED on an interface indicate?', options: ['Interface is disabled', 'A connection is established', 'An error occurred', 'Security level 0'], answer: 1, explanation: 'A green LINK LED means the connection is up.' },
    { type: 'mcq', q: 'Which interface is NOT enabled by default on the ASA in Lab 4?', options: ['gi 1/1', 'gi 1/2', 'gi 1/3 and gi 1/4', 'none of them'], answer: 2, explanation: 'gi 1/3 and gi 1/4 are not enabled by default (LINK LED OFF).' },
  ],

  5: [
    { type: 'mcq', q: 'Which command names an ASA interface "outside"?', options: ['nameif outside', 'interface outside', 'ip name outside', 'label outside'], answer: 0, explanation: '`nameif outside` assigns the "outside" name to an interface.' },
    { type: 'mcq', q: 'Which command sets an interface to security level 0?', options: ['security-level 0', 'level 0', 'trust 0', 'zone 0'], answer: 0, explanation: '`security-level 0` marks it as least secure (outside).' },
    { type: 'mcq', q: 'Which command assigns the IP address 209.165.200.225 /24 to an interface?', options: ['ip address 209.165.200.225 255.255.255.0', 'ip 209.165.200.225', 'set ip 209.165.200.225', 'address 209.165.200.225'], answer: 0, explanation: '`ip address <ip> <mask>` sets the interface IP.' },
    { type: 'mcq', q: 'In Lab 5, what is the public IP address of the DMZ web server?', options: ['10.30.30.30', '209.165.200.226', '209.165.200.225', '192.168.1.1'], answer: 1, explanation: 'The DMZ web server is publicly reachable at 209.165.200.226.' },
    { type: 'mcq', q: 'In Lab 5, what is the private (real) IP of the DMZ web server?', options: ['10.30.30.30', '10.10.10.10', '209.165.200.226', '192.168.1.1'], answer: 0, explanation: 'The web server\u2019s real IP is 10.30.30.30.' },
    { type: 'mcq', q: 'A static NAT rule translates the DMZ web server\u2019s real IP to a ______.', options: ['pool of addresses', 'single public IP (209.165.200.226)', 'private address', 'port number'], answer: 1, explanation: 'Static NAT maps the server 1:1 to a single public IP.' },
    { type: 'mcq', q: 'PAT (interface NAT) translates internal client IPs to ______.', options: ['the DMZ server IP', 'the outside interface\u2019s public IP', 'a random private IP', '192.168.1.1'], answer: 1, explanation: 'PAT maps many internal IPs to the outside interface\u2019s public IP using ports.' },
    { type: 'mcq', q: 'In Lab 5, the ACL is used to allow which service to the DMZ?', options: ['FTP', 'HTTP', 'SSH', 'SMTP'], answer: 1, explanation: 'The ACL permits HTTP to the DMZ web server.' },
    { type: 'mcq', q: 'ASA security levels range from ___ to ___.', options: ['0 to 100', '1 to 255', '0 to 255', '1 to 99'], answer: 0, explanation: 'Security levels are 0 (least) to 100 (most).' },
    { type: 'mcq', q: 'Perimeter (DMZ) interfaces can have security levels from ___ to ___.', options: ['0 to 99', '1 to 99', '1 to 100', '50 to 100'], answer: 1, explanation: 'Perimeter interfaces can be 1–99; 0 and 100 are reserved.' },
    { type: 'mcq', q: 'What is a DMZ?', options: ['A separate network between private and public networks', 'The most secure internal network', 'A VPN tunnel', 'A type of firewall hardware'], answer: 0, explanation: 'A DMZ sits in the neutral zone between inside (private) and outside (public).' },
    { type: 'mcq', q: 'In Lab 5, the inside interface has which IP address?', options: ['10.10.10.10', '10.30.30.30', '192.168.1.1', '209.165.200.225'], answer: 0, explanation: 'The inside (gi 1/3) interface is 10.10.10.10.' },
    { type: 'tf', q: 'In Lab 5, the outside interface IP is 209.165.200.225.', answer: true, explanation: 'gi 1/1 (outside) is 209.165.200.225.' },
    { type: 'mcq', q: 'Which interface is used to run ASDM in Lab 5?', options: ['outside (gi1/1)', 'ASDM_MGMT (gi1/2)', 'inside (gi1/3)', 'DMZ (gi1/4)'], answer: 1, explanation: 'ASDM runs via the ASDM_MGMT (gi1/2) interface.' },
  ],

  6: [
    { type: 'mcq', q: 'Which command enables ISAKMP on a router?', options: ['crypto isakmp enable', 'crypto ipsec enable', 'isakmp on', 'vpn enable'], answer: 0, explanation: '`crypto isakmp enable` turns on IKE/ISAKMP.' },
    { type: 'mcq', q: 'Which command creates an ISAKMP policy?', options: ['crypto isakmp policy 1', 'crypto policy 1', 'ipsec policy 1', 'isakmp create 1'], answer: 0, explanation: '`crypto isakmp policy <n>` enters ISAKMP policy config mode.' },
    { type: 'mcq', q: 'What does the `authentication pre-share` command configure?', options: ['Pre-shared key authentication', 'Certificate authentication', 'No authentication', 'RADIUS'], answer: 0, explanation: 'It sets pre-shared key authentication for the ISAKMP policy.' },
    { type: 'mcq', q: 'Which command sets the shared key for a VPN client configuration group?', options: ['key MYVPNKEY', 'password MYVPNKEY', 'secret MYVPNKEY', 'pre-share MYVPNKEY'], answer: 0, explanation: '`key MYVPNKEY` sets the group pre-shared key.' },
    { type: 'mcq', q: 'Which command assigns an IP address pool to VPN clients?', options: ['pool REMOTE-POOL', 'ip pool REMOTE-POOL', 'address-pool REMOTE-POOL', 'dhcp REMOTE-POOL'], answer: 0, explanation: '`pool REMOTE-POOL` assigns the local pool to the client group.' },
    { type: 'mcq', q: 'Which command creates an IPSec transform set?', options: ['crypto ipsec transform-set VPNTRANSFORM esp-3des', 'ipsec set VPNTRANSFORM', 'transform VPNTRANSFORM', 'crypto transform VPNTRANSFORM'], answer: 0, explanation: '`crypto ipsec transform-set <name> <transform>` creates it.' },
    { type: 'mcq', q: 'What does RRI (Reverse Route Injection) do on an Easy VPN server?', options: ['Creates a static route for each client IP', 'Reverses the tunnel', 'Drops reverse traffic', 'Load-balances VPN'], answer: 0, explanation: 'RRI ensures a route back to each VPN client\u2019s internal network.' },
    { type: 'mcq', q: 'In a client-initiated remote access VPN, the remote user uses ______ to connect.', options: ['a VPN client or web browser', 'an ISP NAS only', 'a leased line', 'a site-to-site router'], answer: 0, explanation: 'Client-initiated VPNs use a VPN client/browser on the user\u2019s device.' },
    { type: 'mcq', q: 'In a NAS-initiated remote access VPN, who establishes the tunnel?', options: ['The remote user\u2019s PC', 'The ISP\u2019s network access server (NAS)', 'The corporate firewall', 'No one — it\u2019s automatic'], answer: 1, explanation: 'The NAS dials and establishes the secure tunnel to the enterprise.' },
    { type: 'mcq', q: 'A dynamic crypto map is used for ______.', options: ['site-to-site peers', 'Easy VPN clients (dynamic addresses)', 'DMZ servers', 'routing'], answer: 1, explanation: 'Dynamic crypto maps build tunnels to clients with unknown/dynamic IPs.' },
    { type: 'mcq', q: 'The Easy VPN server runs on which device in Lab 6?', options: ['A Cisco router', 'An ASA firewall', 'A switch', 'A PC'], answer: 0, explanation: 'The lab configures a Cisco Router as the Easy VPN server.' },
    { type: 'mcq', q: 'The ISAKMP SA is established in which step of Easy VPN?', options: ['Before any data flows (step 2)', 'After data transfer', 'Only for site-to-site', 'It is optional'], answer: 0, explanation: 'The VPN client first establishes an ISAKMP SA to secure the channel.' },
    { type: 'mcq', q: 'Which encryption does the example ISAKMP policy use?', options: ['3DES', 'AES', 'DES', 'None'], answer: 0, explanation: '`encryption 3des` is configured in the ISAKMP policy.' },
    { type: 'mcq', q: 'What does a VPN provide? (pick the best answer)', options: ['Authentication, data integrity and confidentiality', 'Only encryption', 'Only routing', 'Only compression'], answer: 0, explanation: 'VPN services provide authentication, integrity and confidentiality.' },
  ],

  7: [
    { type: 'mcq', q: 'Which command sets the pre-shared key for a specific peer IP?', options: ['crypto isakmp key cisco1234 address 10.23.x.2', 'crypto key cisco1234', 'isakmp key cisco1234', 'ipsec key cisco1234'], answer: 0, explanation: '`crypto isakmp key <key> address <peer>` sets the peer pre-shared key.' },
    { type: 'mcq', q: 'A crypto ACL (e.g. `access-list 101 permit ip 10.24.x.0 0.0.0.255 10.25.x.0 0.0.0.255`) defines ______.', options: ['which traffic is to be protected', 'which users can log in', 'which ports to open', 'the DMZ rules'], answer: 0, explanation: 'The crypto ACL lists the interesting (protected) traffic.' },
    { type: 'mcq', q: 'Which command creates a transform set with esp-sha-hmac and esp-3des?', options: ['crypto ipsec transform-set RouterBtransform esp-sha-hmac esp-3des', 'transform-set esp-3des', 'crypto transform esp-sha-hmac', 'ipsec esp-3des'], answer: 0, explanation: '`crypto ipsec transform-set <name> <transform1> <transform2>` defines it.' },
    { type: 'mcq', q: 'Which are the four major functions of IPSec?', options: ['Confidentiality, integrity, authentication, anti-replay', 'Routing, switching, NAT, ACL', 'Encryption, compression, caching, load-balancing', 'DHCP, DNS, HTTP, FTP'], answer: 0, explanation: 'IPSec provides confidentiality, data integrity, authentication, and anti-replay protection.' },
    { type: 'mcq', q: 'Which protocols became popular for VPNs?', options: ['PPTP, L2TP, IPSec', 'HTTP, FTP, SMTP', 'OSPF, BGP, RIP', 'DNS, DHCP, NTP'], answer: 0, explanation: 'PPTP, L2TP and IPSec are common VPN protocols.' },
    { type: 'mcq', q: 'If you do not configure the IPSec connection mode, it defaults to ______.', options: ['tunnel', 'transport', 'gre', 'none'], answer: 0, explanation: 'IPSec defaults to tunnel mode.' },
    { type: 'mcq', q: 'Which command displays the running configuration?', options: ['show running-configuration', 'show config', 'display run', 'show startup'], answer: 0, explanation: '`show running-configuration` shows the active config.' },
    { type: 'mcq', q: 'Which command checks the crypto map / VPN status?', options: ['show crypto map', 'show ip route', 'show access-list', 'show interfaces'], answer: 0, explanation: '`show crypto map` displays the crypto map configuration.' },
    { type: 'mcq', q: 'Which ACL permits ISAKMP (UDP 500) traffic between peers?', options: ['access-list 100 permit udp host 10.23.x.1 host 10.23.x.2 eq isakmp', 'access-list 100 permit tcp any any', 'access-list 100 permit icmp any any', 'access-list 100 deny udp any any'], answer: 0, explanation: 'ISAKMP uses UDP port 500, permitted with `eq isakmp`.' },
    { type: 'mcq', q: 'IPSec operates at which OSI layer?', options: ['Network layer', 'Transport layer', 'Application layer', 'Data link layer'], answer: 0, explanation: 'IPSec protects IP packets at the network layer.' },
    { type: 'mcq', q: 'Which IP protocol numbers are used by IPSec (permitted in the ACL)?', options: ['AH and ESP', 'TCP and UDP', 'ICMP and IGMP', 'GRE and OSPF'], answer: 0, explanation: 'IPSec uses AH and ESP (plus ISAKMP/UDP 500).' },
    { type: 'mcq', q: 'In Lab 7, the participating peers are ______.', options: ['perimeter routers', 'switches', 'ASA firewalls', 'PCs'], answer: 0, explanation: 'Perimeter routers are the IPSec peer devices.' },
    { type: 'mcq', q: 'Which command enters ISAKMP policy configuration mode?', options: ['crypto isakmp policy 10', 'crypto policy 10', 'isakmp 10', 'ipsec policy 10'], answer: 0, explanation: '`crypto isakmp policy 10` enters config-isakmp mode.' },
  ],
};

// Generic questions for the image-based Labs 1-3 (scanned PDFs, no text).
const CURATED_GENERIC_LAB_QUESTIONS = [
  { type: 'mcq', q: 'Which ASA interface is the most trusted (highest security level)?', options: ['outside', 'inside', 'DMZ', 'all are equal'], answer: 1, explanation: 'The inside interface has security level 100.' },
  { type: 'mcq', q: 'Which ASA interface has security level 0?', options: ['inside', 'DMZ', 'outside', 'management'], answer: 2, explanation: 'The outside interface is always security level 0.' },
  { type: 'mcq', q: 'What does a solid green LINK LED on an interface indicate?', options: ['A connection is established', 'Interface is administratively down', 'A security violation', 'VLAN mismatch'], answer: 0, explanation: 'A green LINK LED means the physical link is up.' },
  { type: 'mcq', q: 'Which command tests basic connectivity to another host?', options: ['ping', 'dir', 'show', 'reload'], answer: 0, explanation: '`ping` tests reachability.' },
  { type: 'mcq', q: 'Which command shows the current IP configuration on a Windows PC?', options: ['ipconfig', 'ifconfig', 'ip addr', 'show ip'], answer: 0, explanation: '`ipconfig` shows Windows IP settings.' },
  { type: 'mcq', q: 'Which command shows IP configuration on Linux?', options: ['ipconfig', 'ifconfig', 'show ip', 'winipcfg'], answer: 1, explanation: '`ifconfig` (or `ip addr`) shows Linux IP settings.' },
  { type: 'tf', q: 'Traffic from a higher security level to a lower security level is generally allowed by default on an ASA.', answer: true, explanation: 'ASA permits higher→lower by default unless an ACL blocks it.' },
  { type: 'tf', q: 'Traffic from a lower security level to a higher security level (e.g. outside→inside) is allowed by default.', answer: false, explanation: 'Lower→higher is denied by default; it needs an ACL.' },
  { type: 'mcq', q: 'What is the purpose of a default gateway on a host?', options: ['To route traffic to other networks', 'To assign an IP address', 'To filter packets', 'To resolve DNS'], answer: 0, explanation: 'A default gateway is the router a host sends off-network traffic to.' },
  { type: 'mcq', q: 'What subnet mask corresponds to a /24 network?', options: ['255.255.255.0', '255.255.0.0', '255.0.0.0', '255.255.255.255'], answer: 0, explanation: '/24 = 255.255.255.0 (254 usable hosts).' },
  { type: 'mcq', q: 'How many usable host addresses are in a /24 network?', options: ['254', '256', '128', '512'], answer: 0, explanation: 'A /24 has 256 addresses, minus network and broadcast = 254 hosts.' },
  { type: 'mcq', q: 'Which ASA interface is typically used to access the ASDM graphical interface?', options: ['The management (MGMT) interface', 'The outside interface', 'The console port', 'The DMZ'], answer: 0, explanation: 'ASDM is reached via the management interface (gi 1/2).' },
  { type: 'mcq', q: 'Which of these is a valid private IPv4 address?', options: ['10.10.10.10', '8.8.8.8', '209.165.200.225', '172.32.0.1'], answer: 0, explanation: '10.0.0.0/8 is private (RFC 1918).' },
  { type: 'mcq', q: 'Which ASA access method is NOT encrypted by default?', options: ['Telnet', 'SSH', 'ASDM over HTTPS', 'Console'], answer: 0, explanation: 'Telnet sends traffic in cleartext; SSH/HTTPS are encrypted.' },
  { type: 'mcq', q: 'What does the `show running-config` command display?', options: ['The active configuration', 'The saved startup config', 'The routing table', 'The interface statistics'], answer: 0, explanation: '`show running-config` shows the live configuration.' },
  { type: 'mcq', q: 'What does DHCP allow a host to do?', options: ['Obtain an IP address automatically', 'Encrypt traffic', 'Resolve names to IPs', 'Block attacks'], answer: 0, explanation: 'DHCP automatically assigns IP settings to hosts.' },
  { type: 'mcq', q: 'What is the broadcast address of the network 192.168.1.0/24?', options: ['192.168.1.255', '192.168.1.0', '192.168.1.1', '255.255.255.0'], answer: 0, explanation: 'The last address in the subnet (all host bits = 1) is the broadcast.' },
  { type: 'mcq', q: 'Which command on a Windows host shows the routing table?', options: ['route print', 'netstat', 'ipconfig', 'tracert'], answer: 0, explanation: '`route print` displays the host routing table.' },
  { type: 'mcq', q: 'Which command on Windows traces the path packets take to a destination?', options: ['tracert', 'ping', 'ipconfig', 'nslookup'], answer: 0, explanation: '`tracert` shows each hop to the destination.' },
];

// General diagram / networking questions added across the firewall + network content.
const CURATED_DIAGRAM_QUESTIONS = [
  { type: 'mcq', q: 'In a star topology, all devices connect to a central ______.', options: ['switch or hub', 'backbone cable', 'neighbouring node', 'ring'], answer: 0, explanation: 'Star topologies use a central switch/hub.' },
  { type: 'mcq', q: 'In a bus topology, devices share a single ______.', options: ['backbone cable', 'central switch', 'closed loop', 'mesh of links'], answer: 0, explanation: 'Bus topologies use one shared backbone cable.' },
  { type: 'mcq', q: 'Which OSI layer is responsible for routing between networks?', options: ['Network (3)', 'Transport (4)', 'Data link (2)', 'Application (7)'], answer: 0, explanation: 'Routing happens at the network layer.' },
  { type: 'mcq', q: 'Which OSI layer provides end-to-end (TCP/UDP) delivery?', options: ['Transport (4)', 'Network (3)', 'Session (5)', 'Physical (1)'], answer: 0, explanation: 'Transport provides end-to-end delivery with TCP/UDP.' },
  { type: 'mcq', q: 'In a DMZ setup, where should a public web server be placed?', options: ['In the DMZ', 'On the inside network', 'On the outside (Internet)', 'Behind the second firewall only'], answer: 0, explanation: 'Public servers go in the DMZ, isolated from the inside network.' },
  { type: 'mcq', q: 'Which device is typically placed at the network perimeter?', options: ['A firewall', 'An access switch', 'A core switch', 'An access point'], answer: 0, explanation: 'A firewall sits at the perimeter, separating inside from outside.' },
  { type: 'mcq', q: 'An IDS (Intrusion Detection System) is deployed ______ the traffic path.', options: ['off to the side of (copies traffic)', 'inline within', 'above', 'instead of'], answer: 0, explanation: 'IDS monitors a copy of traffic (out-of-band).' },
  { type: 'mcq', q: 'An IPS (Intrusion Prevention System) is deployed ______ the traffic path.', options: ['inline within', 'off to the side of', 'only in the DMZ', 'only at the edge'], answer: 0, explanation: 'IPS sits inline so it can block traffic.' },
];

module.exports = {
  LAB_TITLES,
  CURATED_LAB_QUESTIONS,
  CURATED_GENERIC_LAB_QUESTIONS,
  CURATED_DIAGRAM_QUESTIONS,
};
