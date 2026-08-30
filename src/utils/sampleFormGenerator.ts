export function generateSampleFormSvgDataUrl(formType: 'account' | 'deposit' = 'account'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#ffffff; font-family: system-ui, -apple-system, sans-serif;">
    <!-- Header Banner -->
    <rect x="0" y="0" width="800" height="90" fill="#0D9488" />
    <text x="40" y="42" fill="#ffffff" font-size="24" font-weight="bold">NATIONAL BANK OF INDIA / தேசிய வங்கி</text>
    <text x="40" y="70" fill="#CCFBF1" font-size="14">SAVINGS ACCOUNT OPENING APPLICATION FORM / சேமிப்பு கணக்கு படிவம்</text>

    <!-- Subtitle section -->
    <rect x="40" y="110" width="720" height="30" fill="#F0FDFA" rx="4" stroke="#99F6E4" />
    <text x="50" y="130" fill="#0F766E" font-size="12" font-weight="bold">PLEASE FILL IN CAPITAL LETTERS ONLY / பெரிய எழுத்துக்களில் மட்டும் நிரப்பவும்</text>

    <!-- Field 1: Full Name -->
    <rect x="40" y="150" width="720" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="175" fill="#334155" font-size="14" font-weight="bold">1. FULL NAME OF APPLICANT / விண்ணப்பதாரரின் முழு பெயர்</text>
    <rect x="55" y="188" width="690" height="24" fill="#FFFFFF" stroke="#94A3B8" stroke-dasharray="3 3"/>
    <text x="65" y="205" fill="#64748B" font-size="12" letter-spacing="4">A R U N   K U M A R</text>

    <!-- Field 2: Account Number -->
    <rect x="40" y="250" width="720" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="275" fill="#334155" font-size="14" font-weight="bold">2. ACCOUNT NUMBER (EXISTING/NEW) / வங்கி கணக்கு எண்</text>
    <g transform="translate(55, 288)">
      ${Array.from({ length: 14 }).map((_, i) => `<rect x="${i * 26}" y="0" width="22" height="24" fill="#FFFFFF" stroke="#94A3B8"/>`).join('')}
    </g>
    <text x="62" y="305" fill="#64748B" font-size="12" letter-spacing="18">50100293847561</text>

    <!-- Field 3: Aadhaar Number -->
    <rect x="40" y="350" width="720" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="375" fill="#334155" font-size="14" font-weight="bold">3. AADHAAR CARD NUMBER / ஆதார் எண்</text>
    <g transform="translate(55, 388)">
      ${Array.from({ length: 12 }).map((_, i) => `<rect x="${i * 26 + Math.floor(i / 4) * 12}" y="0" width="22" height="24" fill="#FFFFFF" stroke="#94A3B8"/>`).join('')}
    </g>

    <!-- Field 4 & 5: Date of Birth & Phone Number -->
    <rect x="40" y="450" width="345" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="475" fill="#334155" font-size="13" font-weight="bold">4. DATE OF BIRTH / பிறந்த தேதி</text>
    <rect x="55" y="488" width="315" height="24" fill="#FFFFFF" stroke="#94A3B8"/>
    <text x="65" y="505" fill="#64748B" font-size="12">15 / 08 / 1995  (DD/MM/YYYY)</text>

    <rect x="415" y="450" width="345" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="430" y="475" fill="#334155" font-size="13" font-weight="bold">5. MOBILE PHONE NO / கைபேசி எண்</text>
    <rect x="430" y="488" width="315" height="24" fill="#FFFFFF" stroke="#94A3B8"/>
    <text x="440" y="505" fill="#64748B" font-size="12">+91 9876543210</text>

    <!-- Field 6 & 7: IFSC Code & PAN Number -->
    <rect x="40" y="550" width="345" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="575" fill="#334155" font-size="13" font-weight="bold">6. BRANCH IFSC CODE / IFSC குறியீடு</text>
    <rect x="55" y="588" width="315" height="24" fill="#FFFFFF" stroke="#94A3B8"/>
    <text x="65" y="605" fill="#64748B" font-size="12">SBIN0001234</text>

    <rect x="415" y="550" width="345" height="70" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="430" y="575" fill="#334155" font-size="13" font-weight="bold">7. PAN CARD NO / பான் எண்</text>
    <rect x="430" y="588" width="315" height="24" fill="#FFFFFF" stroke="#94A3B8"/>
    <text x="440" y="605" fill="#64748B" font-size="12">ABCDE1234F</text>

    <!-- Field 8: Address -->
    <rect x="40" y="650" width="720" height="90" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="55" y="675" fill="#334155" font-size="14" font-weight="bold">8. PERMANENT RESIDENTIAL ADDRESS / இருப்பிட முகவரி</text>
    <line x1="55" y1="700" x2="745" y2="700" stroke="#CBD5E1" stroke-dasharray="2 2"/>
    <line x1="55" y1="725" x2="745" y2="725" stroke="#CBD5E1" stroke-dasharray="2 2"/>
    <text x="65" y="695" fill="#64748B" font-size="12">NO 12, GANDHI STREET, CHENNAI - 600001</text>

    <!-- Field 9 & 10: Unknown / Signature -->
    <rect x="40" y="770" width="345" height="100" fill="#FFFBEB" stroke="#FCD34D" rx="6" stroke-dasharray="4 4"/>
    <text x="55" y="795" fill="#B45309" font-size="12" font-weight="bold">SPECIMEN STAMP / கூடுதல் விவரம் (?)</text>
    <text x="55" y="820" fill="#D97706" font-size="11">[Unclear field / அடையாளம் தெரியாத பகுதி]</text>

    <rect x="415" y="770" width="345" height="100" fill="#F8FAFC" stroke="#CBD5E1" rx="6" stroke-width="1.5"/>
    <text x="430" y="795" fill="#334155" font-size="13" font-weight="bold">9. SIGNATURE OF APPLICANT / கையொப்பம்</text>
    <rect x="430" y="810" width="315" height="50" fill="#FFFFFF" stroke="#94A3B8"/>
    <text x="530" y="840" fill="#94A3B8" font-size="14" font-style="italic">Sign Here / கையொப்பம்</text>

    <!-- Footer -->
    <text x="40" y="940" fill="#94A3B8" font-size="11">FormSaathi AI Verification Seal — Document ID: FORMSAATHI-2026-NBI-0982</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
