export const CV_HREF = '/assets/CV_ATS_Rakha%20Alif%20Athallah.pdf';
export const LINKS = {
  github: 'https://github.com/rakhaalif',
  linkedin: 'https://www.linkedin.com/in/rakhaalif/',
  instagram: 'https://www.instagram.com/rakhaa.athallah/',
};
export const TESTS_WORKFLOW = 'https://github.com/rakhaalif/rakhaalif.github.io/actions/workflows/deploy.yml';

export const ROLES = [
  { title: 'SQA Automation Intern', org: 'PT Telkom Indonesia', when: 'Jul to Sep 2025', text: 'Built an agentic AI that generates and runs functional and visual tests.' },
  { title: 'Machine Learning Engineer', org: 'DBS Coding Camp', when: 'Feb to Jul 2025', text: 'Predictive models in Python and image classifiers in TensorFlow.' },
  { title: 'Vice Chairman', org: 'HMDTIF Brawijaya', when: 'Nov 2024 to Nov 2025', text: 'Ran a student association of 90 members and 20+ work programmes.' },
  { title: 'Head of Quality Control', org: 'PKKMB', when: 'Feb 2024 to Jan 2025', text: 'Led 7 staff checking services for 860+ new students.' },
  { title: 'Laboratory Assistant', org: 'Universitas Brawijaya', when: 'Feb to Jul 2024', text: 'Taught algorithms and data structures labs to 30+ students.' },
];

const CREDLY = 'https://www.credly.com/badges/36ef9d8b-8574-4093-9990-40a6b82459cc';
export const CERTS = [
  { name: 'Google Analytics Certification', issuer: 'Google Skillshop', when: 'Aug 2026', href: 'https://skillshop.credential.net/e317fadc-370c-45a4-ad2c-20d54bab5621#acc.yI9uY5oQ' },
  { name: 'Python Data Analysis', issuer: 'DBS Coding Camp', when: 'Jun 2025', href: 'https://drive.google.com/file/d/1Tb2F5FATKCqwWLmW80EsZkUSSWQ00BNq/view' },
  { name: 'Fundamental Deep Learning', issuer: 'Dicoding Indonesia', when: 'Jun 2025', href: 'https://dicoding.com/certificates/72ZDKQR1VPYW' },
  { name: 'Machine Learning Terapan', issuer: 'Dicoding Indonesia', when: 'Jun 2025', href: 'https://dicoding.com/certificates/KEXL2EVO0ZG2' },
  { name: 'Fundamental Pemrosesan Data', issuer: 'Dicoding Indonesia', when: 'Jun 2025', href: 'https://dicoding.com/certificates/JMZVVQ8KRZN9' },
  { name: 'Data Engineering', issuer: 'AWS', when: 'May 2025', href: CREDLY },
  { name: 'Analisis Data dengan Python', issuer: 'Dicoding Indonesia', when: 'May 2025', href: 'https://dicoding.com/certificates/N9ZO23Q8RPG5' },
  { name: 'Complete Data Science Bootcamp', issuer: 'Udemy', when: 'Dec 2024', href: CREDLY },
  { name: 'Machine Learning Practice', issuer: 'Udemy', when: '2024', href: CREDLY },
];

const P = '/assets/img/';
export const DATA_PROJECTS = [
  {
    title: 'Anime recommender on GitHub',
    text: 'Anime Recommendation System: content-based and collaborative filtering on what viewers rated.',
    tags: ['scikit-learn', 'pandas'], href: 'https://github.com/rakhaalif/Sistem-Rekomendasi-Anime',
    img: `${P}photo-f46928304-960.jpg`, srcSet: `${P}photo-f46928304-500.jpg 500w, ${P}photo-f46928304-960.jpg 960w`, width: 960, height: 722,
    alt: 'A shelf of manga volumes',
  },
  {
    title: 'Sentiment analysis of Tokopedia reviews',
    text: 'NLP classifiers that label customer reviews from the Tokopedia marketplace positive or negative.',
    tags: ['Python', 'scikit-learn'], href: 'https://github.com/rakhaalif/analisis-sentimen-tokopedia',
    img: `${P}photo-f191913514.jpg`, srcSet: `${P}photo-f191913514-500.jpg 500w, ${P}photo-f191913514-960.jpg 960w, ${P}photo-f191913514.jpg 1280w`, width: 1280, height: 853,
    alt: 'A shopper reading a phone while leaning on a shopping trolley',
  },
  {
    title: 'Brazil e-commerce sales dashboard',
    text: 'An interactive view of Brazilian online sales, customer behaviour and delivery trends.',
    tags: ['Python', 'pandas'], href: 'https://github.com/rakhaalif/Dashboard-E-Commerce-Brazil',
    img: `${P}photo-f138536950-900.jpg`, srcSet: `${P}photo-f138536950-500.jpg 500w, ${P}photo-f138536950-900.jpg 900w`, width: 900, height: 1200, pos: '50% 60%',
    alt: 'A cardboard shipping box on a carpet',
  },
];

// icon: a file in /assets/icons; '' is a text tile (Squash has no logo licence on file)
export const STACK: { group: string; tools: { name: string; icon: string; href?: string }[] }[] = [
  { group: 'QA and testing', tools: [{ name: 'Playwright', icon: 'playwright.svg', href: TESTS_WORKFLOW }, { name: 'Squash', icon: '' }] },
  { group: 'AI and ML', tools: [
    { name: 'scikit-learn', icon: 'scikitlearn.svg' }, { name: 'TensorFlow', icon: 'tensorflow.svg' },
    { name: 'Keras', icon: 'keras.svg' }, { name: 'Gemini API', icon: 'gemini.svg' }] },
  { group: 'Data', tools: [
    { name: 'pandas', icon: 'pandas-icon.svg' }, { name: 'NumPy', icon: 'numpy.svg' },
    { name: 'Matplotlib', icon: 'matplotlib-icon.svg' }, { name: 'Seaborn', icon: 'seaborn-icon.svg' }] },
  { group: 'Languages and tools', tools: [
    { name: 'Python', icon: 'python.svg' }, { name: 'Java', icon: 'java.svg' }, { name: 'R', icon: 'r-lang.svg' },
    { name: 'SQL', icon: 'sql.svg' }, { name: 'AWS', icon: 'aws.svg' }, { name: 'Git', icon: 'git-icon.svg' },
    { name: 'VS Code', icon: 'vscode.svg' }, { name: 'RStudio', icon: 'rstudioide.svg' }] },
];
export const iconFor = (name: string) => STACK.flatMap(g => g.tools).find(t => t.name === name)?.icon || '';
