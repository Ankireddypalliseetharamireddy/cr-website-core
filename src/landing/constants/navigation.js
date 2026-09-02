export const navLinks = [
  { label: 'Home', path: '#home', id: 'home' },
  {label:'About Us', path: '/about', id: 'about'},
  { label: 'Investment Model', path: '#investment', id: 'investment' },
  { label: 'Benefits', path: '#benefits', id: 'benefits' },
  { label: 'Process', path: '#process', id: 'process' },
  { label: 'Contact', path: '#contact', id: 'contact' },
];

export const VALID_HASHES = new Set([
  '',
  '#',
  '#top',
  '#home',
  '#growth',
  '#about',
  '#investment',
  '#investment-model',
  '#investment-recovery',
  '#benefits',
  '#process',
  '#contact',
  '#collections',
  '#thankyou',
  '#thank-you',
]);

export const footerLinks = {
  investor: [
    { label: 'Investment Model', path: '#investment' },
    { label: 'FOCO Framework', path: '#benefits' },
    { label: 'Investor Deck', modal: 'brochure' },
    { label: 'CCTV Live Store Demo', modal: 'cctv' },
  ],
  company: [
    { label: 'About Cavree', path: '#about' },
    { label: 'Growth Milestones', path: '#growth' },
    { label: 'Pan-India Stores', path: '#stores' },
    { label: 'Contact Leadership', path: '#contact' },
  ],
  governance: [
    { label: 'Asset Security & Escrow', path: '#benefits' },
    { label: 'Buyback Guarantee', path: '#benefits' },
    { label: 'Territory Checker', modal: 'location' },
    { label: 'Compliance & Audit', path: '#benefits' },
  ],
};

export default navLinks;
