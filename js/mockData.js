/**
 * CareerSphere - Mock Data Store
 * Realistic sample data for Corporate Jobs, Government Notifications, Internships,
 * Exam Preparation Tracks, Student Projects, and Seed Notes.
 */

export const MOCK_CORPORATE_JOBS = [
  {
    id: 'corp-1',
    title: 'Associate Software Engineer (Fresher 2024/2025)',
    company: 'Zoho Corporation',
    logo: '🏢',
    category: 'Software Developer',
    roleCategory: 'Fresher Jobs',
    workType: 'Full-time',
    location: 'Chennai / Tenkasi',
    experience: 'Fresher (0-1 yr)',
    salary: '₹6.5 - ₹8.5 LPA',
    eligibility: 'BCA, B.Sc (CS/IT), B.Tech (Any branch) with 60%+ throughout',
    deadline: '2026-10-15',
    postedDate: '2 days ago',
    skills: ['Java', 'C++', 'Data Structures', 'Problem Solving', 'SQL'],
    description: 'Zoho is hiring passionate entry-level engineers who love coding and problem solving. You will develop scalable SaaS applications used by over 100M+ users globally.',
    responsibilities: [
      'Write clean, maintainable, and efficient code in Java or C++',
      'Collaborate with product managers and architects to build scalable modules',
      'Optimize database queries and participate in peer code reviews',
      'Debug and resolve technical support issues in production'
    ],
    selectionProcess: 'Round 1: Online Aptitude & Coding -> Round 2: Advanced Programming -> Round 3: Tech & HR Interview',
    applyUrl: '#'
  },
  {
    id: 'corp-2',
    title: 'Junior Frontend Developer (React / Next.js)',
    company: 'Razorpay Technologies',
    logo: '⚡',
    category: 'Software Developer',
    roleCategory: 'BCA/IT Jobs',
    workType: 'Hybrid',
    location: 'Bangalore, Karnataka',
    experience: 'Fresher (0-1 yr)',
    salary: '₹8.0 - ₹12.0 LPA',
    eligibility: 'BCA, MCA, B.Tech CS/IT with hands-on portfolio projects',
    deadline: '2026-09-30',
    postedDate: '1 day ago',
    skills: ['React', 'JavaScript (ES6+)', 'HTML5/CSS3', 'Tailwind CSS', 'REST APIs'],
    description: 'Join the Core Banking & Checkout engineering team at Razorpay. Build high-performance, accessible, and delightful payment experiences for millions of consumers.',
    responsibilities: [
      'Develop pixel-perfect web interfaces using modern React and TypeScript',
      'Ensure high performance and cross-browser responsiveness',
      'Integrate RESTful and GraphQL APIs seamlessly with UI components',
      'Write modular, unit-tested frontend code'
    ],
    selectionProcess: 'Take-home assignment -> Tech Deep Dive -> System Discussion & Culture Fit',
    applyUrl: '#'
  },
  {
    id: 'corp-3',
    title: 'Graduate Trainee - IT Infrastructure & Cloud',
    company: 'Tata Consultancy Services (TCS)',
    logo: '🌐',
    category: 'BCA/IT Jobs',
    roleCategory: 'Fresher Jobs',
    workType: 'Full-time',
    location: 'Pune, Maharashtra',
    experience: 'Fresher (0-1 yr)',
    salary: '₹3.6 - ₹4.5 LPA',
    eligibility: 'BCA, B.Sc (IT, CS, Math, Stats, Electronics) 2024/2025 passouts',
    deadline: '2026-10-20',
    postedDate: '3 days ago',
    skills: ['Linux', 'Networking', 'Python Scripting', 'Cloud Basics (AWS/Azure)', 'SQL'],
    description: 'TCS Ignite/Smart Hiring Drive invites BCA and B.Sc graduates to embark on a world-class IT career in cloud administration, enterprise networking, and cybersecurity.',
    responsibilities: [
      'Monitor and support enterprise cloud environments and Linux/Windows servers',
      'Automate routine sysadmin tasks using Python and Bash scripts',
      'Collaborate with global client teams on incident resolution and ITIL protocols',
      'Gain certifications in AWS, Azure, or GCP via TCS learning academy'
    ],
    selectionProcess: 'TCS NQT (Cognitive + IT Technical) -> Technical Interview -> HR Round',
    applyUrl: '#'
  },
  {
    id: 'corp-4',
    title: 'Web Development Intern (Full Stack)',
    company: 'Swiggy',
    logo: '🍔',
    category: 'Internships',
    roleCategory: 'Internships',
    workType: 'Remote',
    location: 'Work From Home',
    experience: 'Students / 0-1 yr',
    salary: '₹35,000 / month',
    eligibility: 'Pre-final and Final year students pursuing BCA, MCA, or B.Tech',
    deadline: '2026-09-28',
    postedDate: 'Just now',
    skills: ['Node.js', 'Express', 'React', 'MongoDB', 'Git'],
    description: 'Swiggy is seeking an energetic Web Development Intern for a 6-month paid internship. Opportunity for Pre-Placement Offer (PPO) based on internship performance.',
    responsibilities: [
      'Build internal dashboard tools for partner merchant analytics',
      'Write REST APIs in Node.js and connect with MongoDB and Redis',
      'Collaborate with senior engineering mentors on sprint deliverables'
    ],
    selectionProcess: 'Resume Screening -> Coding Challenge -> 1-on-1 Mentor Interview',
    applyUrl: '#'
  },
  {
    id: 'corp-5',
    title: 'Data Analyst Intern (Remote)',
    company: 'Freshworks',
    logo: '📊',
    category: 'Internships',
    roleCategory: 'Work From Home',
    workType: 'Work From Home',
    location: 'Remote, India',
    experience: 'Students / Fresher',
    salary: '₹30,000 / month',
    eligibility: 'Any graduate/student with solid SQL, Excel, and Python data skills',
    deadline: '2026-10-05',
    postedDate: '4 days ago',
    skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Data Visualization'],
    description: 'Passionate about numbers and uncovering actionable insights? Freshworks is hiring a Data Analyst Intern to assist our growth marketing and customer retention squads.',
    responsibilities: [
      'Write complex SQL queries to extract user retention and funnel cohorts',
      'Design interactive dashboards in Power BI and Google Looker Studio',
      'Cleanse and analyze customer data sets using Python (Pandas/NumPy)'
    ],
    selectionProcess: 'SQL Test -> Dashboard Assessment -> Fitment Interview',
    applyUrl: '#'
  },
  {
    id: 'corp-6',
    title: 'Software Engineer - Python & Django',
    company: 'Cognizant',
    logo: '💻',
    category: 'Software Developer',
    roleCategory: 'Fresher Jobs',
    workType: 'Hybrid',
    location: 'Hyderabad, Telangana',
    experience: 'Fresher (0-1 yr)',
    salary: '₹4.5 - ₹5.5 LPA',
    eligibility: 'Graduates in BCA, MCA, B.Sc CS, B.Tech with Python certification or projects',
    deadline: '2026-10-25',
    postedDate: '5 days ago',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Git'],
    description: 'Cognizant Digital Engineering is expanding our backend talent pool. Build robust web APIs, microservices, and enterprise automation pipelines using modern Python.',
    responsibilities: [
      'Develop scalable backend REST services using Django REST Framework',
      'Write optimized relational database queries and schema migrations',
      'Participate in agile daily standups and sprint planning'
    ],
    selectionProcess: 'Cognizant GenC Tech Assessment -> Technical Interview -> HR Round',
    applyUrl: '#'
  },
  {
    id: 'corp-7',
    title: 'Junior QA Automation Tester',
    company: 'Capgemini',
    logo: '🔍',
    category: 'BCA/IT Jobs',
    roleCategory: 'BCA/IT Jobs',
    workType: 'Full-time',
    location: 'Noida, UP / Gurugram',
    experience: 'Fresher (0-1 yr)',
    salary: '₹4.0 - ₹4.8 LPA',
    eligibility: 'BCA, B.Sc (IT/CS), B.Tech 2024/2025 batches',
    deadline: '2026-10-18',
    postedDate: '6 days ago',
    skills: ['Selenium', 'Java', 'Manual Testing', 'Jira', 'API Testing (Postman)'],
    description: 'Start your software testing career with Capgemini Quality Engineering. Learn test automation frameworks, CI/CD test gates, and functional quality assurance.',
    responsibilities: [
      'Design and execute test cases for web and mobile apps',
      'Automate regression suites using Selenium WebDriver with Java',
      'Report bugs with clear reproduction steps in Jira'
    ],
    selectionProcess: 'Online Assessment -> Technical Interview -> HR Round',
    applyUrl: '#'
  },
  {
    id: 'corp-8',
    title: 'UI/UX Design Intern',
    company: 'CRED',
    logo: '🎨',
    category: 'Internships',
    roleCategory: 'Internships',
    workType: 'Work From Home',
    location: 'Remote / Bangalore',
    experience: 'Fresher / Students',
    salary: '₹40,000 / month',
    eligibility: 'Students or freshers with a strong Figma portfolio of mobile/web UI',
    deadline: '2026-09-25',
    postedDate: 'Just now',
    skills: ['Figma', 'Prototyping', 'Wireframing', 'Design Systems', 'User Research'],
    description: 'CRED is looking for a craft-obsessed UI/UX design intern to collaborate on next-gen fintech product interfaces, micro-interactions, and visual storytelling.',
    responsibilities: [
      'Create high-fidelity wireframes and interactive prototypes in Figma',
      'Conduct user testing interviews and distill feedback into design iterations',
      'Collaborate with frontend engineers to ensure design fidelity in code'
    ],
    selectionProcess: 'Portfolio Review -> Design Challenge -> Creative Director Interview',
    applyUrl: '#'
  }
];

export const MOCK_GOVT_JOBS = [
  {
    id: 'govt-1',
    postName: 'Combined Graduate Level (CGL) Examination 2026',
    organization: 'Staff Selection Commission (SSC)',
    category: 'SSC',
    qualification: 'Graduate',
    qualificationDetail: 'Bachelor Degree in any discipline from a recognized University',
    location: 'All India',
    vacancies: '14,500+ Posts',
    ageLimit: '18 - 30 Years (Age relaxation as per govt rules)',
    applicationFee: '₹100 (SC/ST/Women/PwD: Exempted)',
    startDate: '2026-08-15',
    lastDate: '2026-10-10',
    examDate: 'December 2026',
    status: 'Active',
    salaryPayScale: 'Pay Level 4 to Level 8 (₹25,500 to ₹1,51,100)',
    description: 'SSC CGL is one of India’s most prestigious central government recruitment exams for Group B and C posts across Ministries, Departments, and Central Organizations.',
    postsIncluded: 'Assistant Section Officer (ASO), Income Tax Inspector, Central Excise Inspector, Sub-Inspector (CBI), Auditor, Accountant',
    selectionStages: 'Tier 1 (Computer Based Test) -> Tier 2 (Online Exam) -> Document Verification & Medical',
    syllabusOverview: 'General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, English Comprehension',
    applyUrl: 'https://ssc.gov.in'
  },
  {
    id: 'govt-2',
    postName: 'Probationary Officers (PO / Management Trainee XIV)',
    organization: 'Institute of Banking Personnel Selection (IBPS)',
    category: 'Banking',
    qualification: 'Graduate',
    qualificationDetail: 'Graduation in any stream (BA, B.Sc, B.Com, BCA, B.Tech)',
    location: 'All India (Participating Public Sector Banks)',
    vacancies: '4,455 Posts',
    ageLimit: '20 - 30 Years',
    applicationFee: '₹850 (SC/ST/PwD: ₹175)',
    startDate: '2026-08-20',
    lastDate: '2026-09-25',
    examDate: 'October / November 2026',
    status: 'Closing Soon',
    salaryPayScale: 'Basic Pay ₹36,000 + DA + HRA (Total approx ₹55,000 - ₹62,000/mo)',
    description: 'Recruitment for Probationary Officers across 11 major public sector banks including Bank of Baroda, Canara Bank, Punjab National Bank, and Union Bank of India.',
    postsIncluded: 'Probationary Officer (Scale-I), Assistant Manager',
    selectionStages: 'Preliminary Examination -> Main Examination -> Interview & Document Verification',
    syllabusOverview: 'Reasoning, Quantitative Aptitude, English Language, General & Banking Awareness, Computer Knowledge',
    applyUrl: 'https://ibps.in'
  },
  {
    id: 'govt-3',
    postName: 'Non-Technical Popular Categories (NTPC) Graduate & Under-Graduate',
    organization: 'Railway Recruitment Boards (RRB)',
    category: 'Railway',
    qualification: '10th/12th Pass & Graduate',
    qualificationDetail: '12th Pass for Under-Graduate posts; Any Degree for Graduate posts',
    location: 'All India (All Railway Zones)',
    vacancies: '11,558 Posts',
    ageLimit: '18 - 33 Years',
    applicationFee: '₹500 (₹400 refundable on CBT-1 attendance; SC/ST: ₹250 refundable)',
    startDate: '2026-09-01',
    lastDate: '2026-10-31',
    examDate: 'January 2027',
    status: 'Active',
    salaryPayScale: 'Level 2 to Level 6 (₹19,900 to ₹35,400 initial basic)',
    description: 'Indian Railways Centralized Employment Notice for Station Masters, Goods Train Managers, Senior Clerks, Junior Accounts Assistants, and Commercial Apprentices.',
    postsIncluded: 'Station Master, Goods Guard, Senior Commercial Clerk, Commercial cum Ticket Clerk',
    selectionStages: '1st Stage CBT -> 2nd Stage CBT -> Typing / CBAT Test -> Document Verification',
    syllabusOverview: 'General Awareness (40 marks), Mathematics (30 marks), General Intelligence & Reasoning (30 marks)',
    applyUrl: 'https://indianrailways.gov.in'
  },
  {
    id: 'govt-4',
    postName: 'Gramin Dak Sevak (GDS) - Branch Postmaster (BPM) & ABPM',
    organization: 'Department of Posts (India Post)',
    category: 'India Post',
    qualification: '10th/12th Pass',
    qualificationDetail: '10th standard pass certificate with Mathematics and English + local language proficiency',
    location: 'All Postal Circles Across India',
    vacancies: '44,228 Posts',
    ageLimit: '18 - 40 Years',
    applicationFee: '₹100 (Female/SC/ST/Transgender: Nil)',
    startDate: '2026-08-10',
    lastDate: '2026-09-20',
    examDate: 'Merit-Based (No Written Exam)',
    status: 'Closing Soon',
    salaryPayScale: 'TRCA Allowance: ₹12,000 - ₹29,380 per month',
    description: 'Direct recruitment based on 10th class board marks merit list for Gramin Dak Sevaks across urban and rural postal branch offices across all 23 postal circles in India.',
    postsIncluded: 'Branch Postmaster (BPM), Assistant Branch Postmaster (ABPM), Dak Sevak',
    selectionStages: '10th Class Merit List Generation -> Document Verification at Divisional Office',
    syllabusOverview: 'No written examination. Selection strictly based on 10th standard marks calculation.',
    applyUrl: 'https://indiapostgdsonline.gov.in'
  },
  {
    id: 'govt-5',
    postName: 'Sub-Inspector (Executive) in Delhi Police & CAPF',
    organization: 'Staff Selection Commission (SSC / Delhi Police)',
    category: 'Police/Defence',
    qualification: 'Graduate',
    qualificationDetail: 'Bachelor degree from recognized university + Valid Driving License for LMV (for Delhi Police)',
    location: 'Delhi & All India (BSF, CISF, CRPF, ITBP, SSB)',
    vacancies: '4,187 Posts',
    ageLimit: '20 - 25 Years',
    applicationFee: '₹100 (SC/ST/Ex-Servicemen/Women: Exempted)',
    startDate: '2026-09-05',
    lastDate: '2026-10-15',
    examDate: 'November 2026',
    status: 'Active',
    salaryPayScale: 'Level-6 (₹35,400 to ₹1,12,400)',
    description: 'Prestigious direct recruitment for Sub-Inspectors in Delhi Police and Central Armed Police Forces (CAPF) under Ministry of Home Affairs.',
    postsIncluded: 'Sub-Inspector (Delhi Police Executive), SI in CISF, BSF, CRPF, ITBP, SSB',
    selectionStages: 'Paper-I (CBT) -> Physical Standard & Endurance Test (PST/PET) -> Paper-II (English) -> Medical',
    syllabusOverview: 'General Intelligence, GK & General Awareness, Quantitative Aptitude, English Comprehension',
    applyUrl: 'https://ssc.gov.in'
  },
  {
    id: 'govt-6',
    postName: 'State Civil Services Combined Competitive Exam (PCS 2026)',
    organization: 'Uttar Pradesh Public Service Commission (UPPSC)',
    category: 'State Government',
    qualification: 'Graduate',
    qualificationDetail: 'Graduation in any discipline from an Indian recognized University',
    location: 'Uttar Pradesh',
    vacancies: '380 Posts',
    ageLimit: '21 - 40 Years',
    applicationFee: '₹125 (SC/ST: ₹65, PwD: ₹25)',
    startDate: '2026-09-12',
    lastDate: '2026-10-22',
    examDate: 'December 2026',
    status: 'Active',
    salaryPayScale: 'Pay Band ₹9300-34800 / Grade Pay ₹4600 - ₹5400',
    description: 'Premier state administrative services recruitment for Deputy Collector (SDM), Deputy Superintendent of Police (DSP), Block Development Officer (BDO), and ARTO.',
    postsIncluded: 'Sub-Divisional Magistrate, DSP, Treasury Officer, Commercial Tax Officer',
    selectionStages: 'Preliminary Exam (GS-I & CSAT) -> Mains Written Exam (8 Papers) -> Personality Interview',
    syllabusOverview: 'General Studies I-VI (including UP specific heritage, economy, geography) & General Hindi',
    applyUrl: 'https://uppsc.up.nic.in'
  },
  {
    id: 'govt-7',
    postName: 'Junior Engineer & IT Officer Recruitment',
    organization: 'State Bank of India (SBI)',
    category: 'Banking',
    qualification: 'B.Tech/BCA',
    qualificationDetail: 'BCA / B.Sc Computer Science / B.Tech (IT/CS/ECE) with 60% aggregate',
    location: 'All India (SBI Local Head Offices)',
    vacancies: '1,200 Posts',
    ageLimit: '21 - 30 Years',
    applicationFee: '₹750 (SC/ST/PwD: Nil)',
    startDate: '2026-09-15',
    lastDate: '2026-10-28',
    examDate: 'December 2026',
    status: 'Upcoming',
    salaryPayScale: 'Junior Management Grade Scale I (₹36,000 - ₹63,840)',
    description: 'Specialist Officer IT hiring by India’s largest commercial bank. Roles span core banking application development, network security, and database infrastructure.',
    postsIncluded: 'Assistant Manager (IT), Software Developer, Cloud & Cyber Security Specialist',
    selectionStages: 'Online Written Test (Professional Knowledge + Aptitude) -> Technical Interview',
    syllabusOverview: 'Data Structures, Database Management Systems, Computer Networks, Operating Systems, Reasoning & Quant',
    applyUrl: 'https://sbi.co.in/careers'
  },
  {
    id: 'govt-8',
    postName: 'Post Graduate Teacher (PGT) & TGT Computer Science',
    organization: 'Kendriya Vidyalaya Sangathan (KVS)',
    category: 'Teaching',
    qualification: 'Post Graduate',
    qualificationDetail: 'B.E./B.Tech (CS/IT) OR MCA OR M.Sc (CS/IT) OR BCA/B.Sc + Post Graduate Degree',
    location: 'All India (Kendriya Vidyalayas)',
    vacancies: '2,800+ Posts',
    ageLimit: 'Up to 40 Years (Women get 10 years relaxation)',
    applicationFee: '₹1500 (SC/ST/PwD: Exempted)',
    startDate: '2026-09-08',
    lastDate: '2026-10-18',
    examDate: 'November 2026',
    status: 'Active',
    salaryPayScale: 'Pay Level 8 (₹47,600 to ₹1,51,100)',
    description: 'Recruitment for PGT Computer Science and Trained Graduate Teachers across nationwide central government Kendriya Vidyalaya institutions.',
    postsIncluded: 'PGT Computer Science, TGT Mathematics, TGT Science',
    selectionStages: 'Computer Based Test (180 Marks) -> Demo Class Teaching & Interview (60 Marks)',
    syllabusOverview: 'Perspectives on Education and Leadership, Computer Science core subject knowledge, Reasoning & GK',
    applyUrl: 'https://kvsangathan.nic.in'
  }
];

export const MOCK_PREPARATION_TRACKS = [
  {
    id: 'prep-aptitude',
    title: 'Aptitude & Quantitative Ability',
    icon: '📐',
    category: 'General',
    description: 'Master number systems, percentages, ratios, time & work, permutations, and data interpretation for campus placements and exams.',
    modulesCount: 16,
    completedModules: 11,
    progress: 68,
    estimatedHours: '28 hrs',
    difficulty: 'All Levels',
    topics: [
      { name: 'Percentages & Profit/Loss', completed: true },
      { name: 'Time, Speed & Distance', completed: true },
      { name: 'Time & Work, Pipes & Cisterns', completed: true },
      { name: 'Ratio, Proportion & Mixtures', completed: true },
      { name: 'Permutations & Combinations', completed: false },
      { name: 'Probability & Statistics', completed: false },
      { name: 'Data Interpretation (Bar & Pie Charts)', completed: true },
      { name: 'Number Series & Simplification', completed: false }
    ]
  },
  {
    id: 'prep-reasoning',
    title: 'Logical & Analytical Reasoning',
    icon: '🧩',
    category: 'General',
    description: 'Master syllogisms, seating arrangements, coding-decoding, blood relations, and analytical puzzles tested by TCS, Infosys, SSC, and Banks.',
    modulesCount: 14,
    completedModules: 9,
    progress: 64,
    estimatedHours: '24 hrs',
    difficulty: 'Beginner to Intermediate',
    topics: [
      { name: 'Syllogism & Logical Deduction', completed: true },
      { name: 'Linear & Circular Seating Arrangement', completed: true },
      { name: 'Coding - Decoding Patterns', completed: true },
      { name: 'Blood Relations & Direction Sense', completed: true },
      { name: 'Input - Output Machine Puzzles', completed: false },
      { name: 'Statement & Assumptions / Conclusions', completed: false }
    ]
  },
  {
    id: 'prep-english',
    title: 'English & Verbal Ability',
    icon: '📖',
    category: 'General',
    description: 'Grammar rules, reading comprehension, sentence correction, synonyms/antonyms, and cloze tests for placement drives and competitive tests.',
    modulesCount: 12,
    completedModules: 9,
    progress: 75,
    estimatedHours: '18 hrs',
    difficulty: 'All Levels',
    topics: [
      { name: 'Active & Passive Voice, Direct/Indirect', completed: true },
      { name: 'Subject - Verb Agreement & Tenses', completed: true },
      { name: 'Reading Comprehension Strategies', completed: true },
      { name: 'Vocabulary & High-Frequency Words', completed: true },
      { name: 'Para Jumbles & Sentence Rearrangement', completed: false }
    ]
  },
  {
    id: 'prep-fundamentals',
    title: 'Computer Fundamentals',
    icon: '🖥️',
    category: 'Technical',
    description: 'Core concepts in Operating Systems, Database Management Systems (DBMS), Computer Networks, and System Architecture.',
    modulesCount: 15,
    completedModules: 12,
    progress: 80,
    estimatedHours: '26 hrs',
    difficulty: 'Intermediate',
    topics: [
      { name: 'OS: Process Management & CPU Scheduling', completed: true },
      { name: 'OS: Memory Management & Paging', completed: true },
      { name: 'DBMS: Relational Model & Normalization (1NF-BCNF)', completed: true },
      { name: 'DBMS: ACID Properties & Transactions', completed: true },
      { name: 'Networks: OSI & TCP/IP Model Layers', completed: true },
      { name: 'Networks: IP Addressing & Subnetting', completed: false }
    ]
  },
  {
    id: 'prep-programming',
    title: 'Programming & Data Structures',
    icon: '💻',
    category: 'Technical',
    description: 'Algorithmic problem solving, Big-O notation, Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Searching/Sorting techniques.',
    modulesCount: 20,
    completedModules: 13,
    progress: 65,
    estimatedHours: '45 hrs',
    difficulty: 'Intermediate to Advanced',
    topics: [
      { name: 'Time & Space Complexity (Asymptotic Notation)', completed: true },
      { name: 'Arrays: Two-Pointer & Sliding Window', completed: true },
      { name: 'Linked Lists (Singly, Doubly, Fast & Slow Pointer)', completed: true },
      { name: 'Stacks & Queues: Implementation & Monotonic Stack', completed: true },
      { name: 'Binary Trees & Traversals (Inorder, BFS, DFS)', completed: false },
      { name: 'Binary Search & Divide and Conquer', completed: false }
    ]
  },
  {
    id: 'prep-python',
    title: 'Python for Developers & Freshers',
    icon: '🐍',
    category: 'Technical',
    description: 'Python 3 syntax, data structures (lists, tuples, dicts, sets), OOP concepts, decorators, file I/O, and introductory Pandas & NumPy.',
    modulesCount: 15,
    completedModules: 13,
    progress: 86,
    estimatedHours: '30 hrs',
    difficulty: 'Beginner to Intermediate',
    topics: [
      { name: 'Python Basics, Flow Control & Functions', completed: true },
      { name: 'List Comprehensions & Generator Expressions', completed: true },
      { name: 'Object Oriented Programming (OOP in Python)', completed: true },
      { name: 'Exception Handling & Custom Exceptions', completed: true },
      { name: 'File Handling & JSON Parsing', completed: true },
      { name: 'Working with Virtual Environments & PIP', completed: true },
      { name: 'Intro to Pandas & Data Manipulation', completed: false }
    ]
  },
  {
    id: 'prep-sql',
    title: 'SQL & Database Querying',
    icon: '🗄️',
    category: 'Technical',
    description: 'Write proficient SQL queries: SELECT, WHERE, JOINs, GROUP BY, Aggregate functions, Subqueries, Window Functions, and Indexes.',
    modulesCount: 12,
    completedModules: 11,
    progress: 91,
    estimatedHours: '20 hrs',
    difficulty: 'All Levels',
    topics: [
      { name: 'DDL & DML Commands Basics', completed: true },
      { name: 'INNER, LEFT, RIGHT, FULL OUTER JOINs', completed: true },
      { name: 'GROUP BY, HAVING & Aggregate Functions', completed: true },
      { name: 'Correlated Subqueries & CTEs', completed: true },
      { name: 'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', completed: true },
      { name: 'Query Optimization & Indexing Strategies', completed: false }
    ]
  },
  {
    id: 'prep-webdev',
    title: 'Modern Web Development (Frontend & Backend)',
    icon: '🌐',
    category: 'Technical',
    description: 'Semantic HTML5, CSS3 Flexbox/Grid, Modern JavaScript (ES6+), React components, and RESTful API backend fundamentals.',
    modulesCount: 18,
    completedModules: 14,
    progress: 77,
    estimatedHours: '40 hrs',
    difficulty: 'Intermediate',
    topics: [
      { name: 'HTML5 Semantic Tags & Accessibility (a11y)', completed: true },
      { name: 'CSS Grid & Flexbox Responsive Design', completed: true },
      { name: 'JavaScript: Promises, Async/Await & Fetch API', completed: true },
      { name: 'React Hooks (useState, useEffect, useContext)', completed: true },
      { name: 'State Management & Component Architecture', completed: false },
      { name: 'Connecting Frontend to REST APIs', completed: true }
    ]
  },
  {
    id: 'prep-interview',
    title: 'HR & Technical Interview Preparation',
    icon: '🤝',
    category: 'Career',
    description: 'Behavioral questions, STAR method responses, self-introduction craft, resume walkthroughs, situational cases, and negotiation tips.',
    modulesCount: 10,
    completedModules: 8,
    progress: 80,
    estimatedHours: '15 hrs',
    difficulty: 'All Levels',
    topics: [
      { name: 'Crafting a 90-Second Standout Self-Intro', completed: true },
      { name: 'STAR Framework for Behavioral Questions', completed: true },
      { name: 'Why Should We Hire You & Strengths/Weaknesses', completed: true },
      { name: 'Explaining Academic Gaps & Transition Stories', completed: true },
      { name: 'Questions to Ask the Interviewer at the End', completed: false }
    ]
  },
  {
    id: 'prep-govexam',
    title: 'Government Exam GK & Current Affairs',
    icon: '🏛️',
    category: 'Government',
    description: 'Indian Constitution, Geography, Modern History, National & International Current Affairs, General Science, and Static GK essentials.',
    modulesCount: 18,
    completedModules: 10,
    progress: 55,
    estimatedHours: '35 hrs',
    difficulty: 'Intermediate',
    topics: [
      { name: 'Indian Polity: Fundamental Rights & Preamble', completed: true },
      { name: 'Indian History: Freedom Movement (1857-1947)', completed: true },
      { name: 'Physical Geography & River Systems of India', completed: true },
      { name: 'Last 6 Months National Current Affairs Digest', completed: false },
      { name: 'Government Schemes & Union Budget Highlights', completed: false },
      { name: 'General Science: Physics, Chemistry & Biology Basics', completed: true }
    ]
  }
];

export const MOCK_PROJECTS = [
  {
    id: 'proj-1',
    name: 'CareerSphere - Student Career & Job Portal',
    category: 'Full Stack',
    difficulty: 'Intermediate',
    summary: 'A comprehensive web platform unifying corporate campus drives, government notifications, exam prep tracks, and an ATS resume builder.',
    technologies: ['HTML5', 'CSS3', 'JavaScript (ES6)', 'LocalStorage', 'Responsive UI'],
    features: [
      'Centralized discovery for Corporate and Government opportunities',
      'Interactive filtering by qualification, role, and location',
      'Dynamic resume generator and student notes keeper',
      'Bookmark and saved jobs management with instant feedback'
    ],
    githubUrl: 'https://github.com/example/career-sphere',
    demoUrl: '#',
    badge: 'Featured'
  },
  {
    id: 'proj-2',
    name: 'AI-Assisted Resume Keyword Screener',
    category: 'Python / ML',
    difficulty: 'Intermediate',
    summary: 'A Python-powered NLP tool that analyzes student resumes against job descriptions, identifies missing technical keywords, and suggests ATS score optimizations.',
    technologies: ['Python', 'NLTK / SpaCy', 'Flask', 'PDFMiner', 'Bootstrap'],
    features: [
      'Extracts skills, education, and years of experience from PDF resumes',
      'Computes Cosine Similarity between resume and target job profile',
      'Actionable recommendations to beat Applicant Tracking Systems (ATS)'
    ],
    githubUrl: 'https://github.com/example/ai-resume-screener',
    demoUrl: '#',
    badge: 'Popular'
  },
  {
    id: 'proj-3',
    name: 'Campus Placement Prep & Mock Quiz App',
    category: 'Web Development',
    difficulty: 'Beginner',
    summary: 'An interactive timed quiz application with randomized question banks for Aptitude, Logical Reasoning, and Technical fundamentals with performance analytics.',
    technologies: ['React', 'JavaScript', 'CSS Modules', 'Web Audio API'],
    features: [
      'Timed assessment mode mimicking real TCS NQT and Infosys test engines',
      'Detailed category-wise score breakdown and review screen',
      'Bookmark difficult questions for revision'
    ],
    githubUrl: 'https://github.com/example/campus-quiz-app',
    demoUrl: '#',
    badge: 'Student Favorite'
  },
  {
    id: 'proj-4',
    name: 'Real-time Government Notification Tracker',
    category: 'Python / ML',
    difficulty: 'Intermediate',
    summary: 'Automated notification monitor that tracks official state and central portal updates, sends email alerts for new openings, and logs application deadlines.',
    technologies: ['Python', 'BeautifulSoup', 'SQLite', 'Schedule', 'SMTP'],
    features: [
      'Automated daily checks across SSC, IBPS, and RRB public feeds',
      'Structured database logging of vacancy dates and qualification criteria',
      'Automated email notification triggers for closing application windows'
    ],
    githubUrl: 'https://github.com/example/govt-job-notifier',
    demoUrl: '#',
    badge: 'Utility'
  },
  {
    id: 'proj-5',
    name: 'Cloud-Based Student Task & Study Planner',
    category: 'Web Development',
    difficulty: 'Beginner',
    summary: 'A productivity dashboard for final-year students featuring Kanban task boards, study countdown timers, and revision notes management.',
    technologies: ['JavaScript', 'HTML5 Drag & Drop', 'CSS Custom Properties', 'LocalStorage'],
    features: [
      'Drag-and-drop task boards: To Do, In Progress, Done',
      'Pomodoro study focus timer with sound alerts',
      'Priority tags and exam target date trackers'
    ],
    githubUrl: 'https://github.com/example/student-planner',
    demoUrl: '#',
    badge: 'Essential'
  },
  {
    id: 'proj-6',
    name: 'E-Commerce Microservices Backend with REST APIs',
    category: 'Full Stack',
    difficulty: 'Advanced',
    summary: 'A scalable backend architecture featuring user authentication, product catalog, shopping cart, and order processing with automated unit testing.',
    technologies: ['Python', 'Django REST Framework', 'PostgreSQL', 'Docker', 'JWT Auth'],
    features: [
      'JWT token-based secure user authentication and role-based access',
      'Optimized SQL queries with indexing and pagination',
      'Docker containerized deployment with comprehensive API documentation'
    ],
    githubUrl: 'https://github.com/example/ecommerce-api-backend',
    demoUrl: '#',
    badge: 'Portfolio Gem'
  }
];

export const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'Top 5 Aptitude Shortcuts for TCS & Infosys',
    category: 'Aptitude',
    date: '2026-09-10',
    content: `1. Time & Work: If A takes x days and B takes y days, together they take (xy)/(x+y) days.
2. Percentage Change: When a value changes by a% then b%, net change = a + b + (ab/100)%.
3. Relative Speed: In opposite directions = S1 + S2; In same direction = S1 - S2.
4. Profit/Loss: Cost Price = (Selling Price * 100) / (100 + Gain%).
5. Alligation Rule: Ratio of cheaper to dearer = (Price of dearer - Mean price) / (Mean price - Price of cheaper).`
  },
  {
    id: 'note-2',
    title: 'SQL Interview Queries: Finding Nth Highest Salary & Duplicates',
    category: 'Tech/Coding',
    date: '2026-09-08',
    content: `Finding 2nd Highest Salary:
SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);

Using DENSE_RANK() for Nth Highest:
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_no FROM employees
) WHERE rank_no = 2;

Finding Duplicate Emails:
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;`
  },
  {
    id: 'note-3',
    title: 'SSC CGL 2026 Tier 1 Strategy & High-Weightage Chapters',
    category: 'Govt Exams',
    date: '2026-09-05',
    content: `Quant Focus:
- Arithmetic: Percentages, Ratio, Time & Work, Profit/Loss (approx 12-14 questions)
- Advanced Math: Algebra, Trigonometry, Geometry, Mensuration (approx 10-12 questions)

General Awareness:
- Modern Indian History (1857-1947) & Indian Polity (Articles 12-51A)
- Current Affairs: Last 6 months sports awards, government portals, summits

Target Attempt: 78+ questions with 90%+ accuracy.`
  },
  {
    id: 'note-4',
    title: 'HR Interview: Master the "Tell Me About Yourself" Question',
    category: 'Interview Prep',
    date: '2026-09-02',
    content: `Structure for Freshers (90 seconds):
1. Who you are: Name, recent degree (BCA/B.Tech), university, current passion.
2. What you built: 1-2 highlight projects (e.g. CareerSphere or Python Screener) and real problems they solve.
3. Relevant Technical Skills: Focus on 3-4 core technologies matching the job spec (e.g. React, Python, SQL).
4. Why this company: Why their engineering culture or mission excites you and how you can contribute immediately.`
  }
];

export const INITIAL_USER_PROFILE = {
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  highestQualification: "Graduate (Bachelor's)",
  college: 'Indira Gandhi Delhi Technical University for Women',
  degree: 'Bachelor of Computer Applications (BCA)',
  graduationYear: '2025',
  graduationStatus: 'Pursuing (Final Year)',
  cgpa: '8.7 / 10.0',
  skills: ['Python', 'JavaScript', 'React', 'SQL', 'Data Structures', 'HTML5/CSS3', 'Git'],
  experience: 'Fresher (0-1 yr)',
  preferredLocations: ['Bangalore', 'Delhi NCR', 'Hyderabad', 'Remote'],
  workPreference: 'Hybrid / Flexible',
  preferredJobType: 'Full-time / Internship',
  preferredSectors: ['Corporate', 'Government', 'Internships'],
  careerPreference: 'Both Corporate & Government',
  targetRoles: 'Software Developer, Data Analyst, Banking Specialist IT Officer',
  github: 'https://github.com/priyasharma',
  bio: 'Final-year BCA student passionate about building modern web applications, data querying, and preparing for software engineering roles and prestigious government IT examinations.'
};

export const MOCK_SOURCES = [
  {
    id: "src-upsc",
    sourceName: "Union Public Service Commission (UPSC)",
    sourceUrl: "https://upsc.gov.in",
    portalSectionUrl: "https://upsc.gov.in/examinations/active-exams",
    sourceType: "official_portal",
    enabled: true,
    lastCheckedTime: "2026-09-16T12:00:00.000Z",
    lastSuccessfulCheck: "2026-09-16T12:00:00.000Z",
    errorStatus: null,
    itemsCount: 2,
    description: "Official portal of UPSC for central civil services, defense, engineering, and administrative recruitment notifications."
  },
  {
    id: "src-ncs",
    sourceName: "National Career Service (NCS)",
    sourceUrl: "https://www.ncs.gov.in",
    portalSectionUrl: "https://www.ncs.gov.in/job-seeker/Pages/Search.aspx",
    sourceType: "official_portal",
    enabled: true,
    lastCheckedTime: "2026-09-16T12:00:00.000Z",
    lastSuccessfulCheck: "2026-09-16T12:00:00.000Z",
    errorStatus: null,
    itemsCount: 2,
    description: "Ministry of Labour & Employment verified government initiatives, apprenticeships, and public enterprise drives."
  },
  {
    id: "src-employment-news",
    sourceName: "Employment News (Govt. of India)",
    sourceUrl: "http://www.employmentnews.gov.in",
    portalSectionUrl: "http://www.employmentnews.gov.in/NewEmp/Home.aspx",
    sourceType: "official_bulletin",
    enabled: true,
    lastCheckedTime: "2026-09-16T12:00:00.000Z",
    lastSuccessfulCheck: "2026-09-16T12:00:00.000Z",
    errorStatus: null,
    itemsCount: 2,
    description: "Weekly flagship recruitment journal by the Ministry of Information & Broadcasting, Government of India."
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif-upsc-cgl-2026",
    organization: "Union Public Service Commission (UPSC)",
    title: "Civil Services (Preliminary) Examination 2026",
    category: "Exams",
    description: "Official notification for recruitment to the Indian Administrative Service, Indian Foreign Service, Indian Police Service and other Group A/B central services.",
    sourceName: "Union Public Service Commission (UPSC)",
    sourceUrl: "https://upsc.gov.in",
    notificationDate: "2026-09-14",
    applicationStartDate: "2026-09-14",
    applicationLastDate: "2026-10-14",
    eligibility: "Graduate degree from any recognized university. Age: 21 to 32 years as on 1st August 2026 (relaxations applicable as per govt rules).",
    qualification: "Any Graduate (BA / B.Sc / B.Com / B.Tech / BCA)",
    location: "Pan India / All India",
    vacancies: "1,056 Posts",
    applyUrl: "https://upsconline.nic.in",
    officialNotificationUrl: "https://upsc.gov.in/examinations/active-exams",
    status: "Active",
    isNew: true,
    isRead: false,
    isDemo: true,
    sourceIdentifier: "upsc-csep-2026",
    firstDiscoveredAt: "2026-09-14T10:00:00.000Z",
    createdAt: "2026-09-14T10:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-upsc-cds-2026",
    organization: "Union Public Service Commission (UPSC)",
    title: "Combined Defence Services Examination (II) 2026 Admit Card Released",
    category: "Admit Cards",
    description: "E-Admit Cards published for candidates appearing in the CDS (II) nationwide written examination for IMA, INA, AFA, and OTA wings.",
    sourceName: "Union Public Service Commission (UPSC)",
    sourceUrl: "https://upsc.gov.in",
    notificationDate: "2026-09-15",
    applicationStartDate: "2026-07-15",
    applicationLastDate: "2026-09-28",
    eligibility: "Degree from a recognized university or engineering graduate as per specific military academy criteria.",
    qualification: "Graduate / Final Year Students",
    location: "All India Examination Centres",
    vacancies: "459 Posts",
    applyUrl: "https://upsconline.nic.in/eadmitcard",
    officialNotificationUrl: "https://upsc.gov.in/examinations/admit-cards",
    status: "Closing Soon",
    isNew: true,
    isRead: false,
    isDemo: true,
    sourceIdentifier: "upsc-cds-admit-card-2026",
    firstDiscoveredAt: "2026-09-15T08:30:00.000Z",
    createdAt: "2026-09-15T08:30:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-ncs-it-specialist-2026",
    organization: "National Career Service (Ministry of Labour & Employment)",
    title: "NCS Public Sector Undertakings IT Apprentice & Trainee Program",
    category: "Internships",
    description: "Ministry of Labour & Employment announced centralized apprentice drive across Central PSUs for computer science, IT, and electronics graduates.",
    sourceName: "National Career Service (NCS)",
    sourceUrl: "https://www.ncs.gov.in",
    notificationDate: "2026-09-15",
    applicationStartDate: "2026-09-10",
    applicationLastDate: "2026-10-05",
    eligibility: "BCA, B.Sc (IT/CS), or B.Tech freshers passing out in 2024, 2025, or 2026 with minimum 60% aggregate.",
    qualification: "BCA / B.Sc / B.Tech (IT/CS)",
    location: "Delhi NCR, Bangalore, Hyderabad, Kolkata",
    vacancies: "850 Trainees",
    applyUrl: "https://www.ncs.gov.in/job-seeker/Pages/Search.aspx",
    officialNotificationUrl: "https://www.ncs.gov.in",
    status: "Active",
    isNew: true,
    isRead: false,
    isDemo: true,
    sourceIdentifier: "ncs-it-trainee-2026",
    firstDiscoveredAt: "2026-09-15T11:00:00.000Z",
    createdAt: "2026-09-15T11:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-ncs-banking-asst-2026",
    organization: "National Career Service (NCS)",
    title: "Public Financial Institutions Junior Operations Associate Drive",
    category: "Government Jobs",
    description: "Verified recruitment notice published on NCS portal for entry-level Operations Associates in regional rural banking federations.",
    sourceName: "National Career Service (NCS)",
    sourceUrl: "https://www.ncs.gov.in",
    notificationDate: "2026-09-13",
    applicationStartDate: "2026-09-08",
    applicationLastDate: "2026-09-30",
    eligibility: "Any Bachelor degree holder with basic computer literacy and proficiency in state regional language.",
    qualification: "Any Graduate",
    location: "Statewise / Multiple Locations",
    vacancies: "1,420 Vacancies",
    applyUrl: "https://www.ncs.gov.in",
    officialNotificationUrl: "https://www.ncs.gov.in",
    status: "Closing Soon",
    isNew: false,
    isRead: true,
    isDemo: true,
    sourceIdentifier: "ncs-banking-ops-2026",
    firstDiscoveredAt: "2026-09-13T09:00:00.000Z",
    createdAt: "2026-09-13T09:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-empnews-drdo-2026",
    organization: "Employment News (Govt. of India)",
    title: "DRDO RAC Scientist B & Technical Officer Recruitment Bulletin",
    category: "Recruitment Forms",
    description: "Employment News weekly issue verified advertisement for Scientist B recruitment through GATE & direct screening across DRDO laboratories.",
    sourceName: "Employment News (Govt. of India)",
    sourceUrl: "http://www.employmentnews.gov.in",
    notificationDate: "2026-09-12",
    applicationStartDate: "2026-09-12",
    applicationLastDate: "2026-10-20",
    eligibility: "First Class Bachelor Degree in Engineering or Master Degree in Science with valid qualification score.",
    qualification: "B.Tech / B.E / M.Sc",
    location: "DRDO Labs (Pan India)",
    vacancies: "204 Posts",
    applyUrl: "https://rac.gov.in",
    officialNotificationUrl: "http://www.employmentnews.gov.in",
    status: "Active",
    isNew: false,
    isRead: true,
    isDemo: true,
    sourceIdentifier: "empnews-drdo-rac-2026",
    firstDiscoveredAt: "2026-09-12T07:30:00.000Z",
    createdAt: "2026-09-12T07:30:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-empnews-ssc-result-2026",
    organization: "Employment News (Govt. of India)",
    title: "SSC Junior Engineer (JE) 2025 Final Result & Cutoff Scores Published",
    category: "Results",
    description: "Staff Selection Commission publishes merit list and department allocation for Civil, Electrical, and Mechanical Junior Engineers.",
    sourceName: "Employment News (Govt. of India)",
    sourceUrl: "http://www.employmentnews.gov.in",
    notificationDate: "2026-09-11",
    applicationStartDate: "2025-10-01",
    applicationLastDate: "2025-11-15",
    eligibility: "Candidates who appeared in SSC JE Paper-II and Document Verification.",
    qualification: "Diploma / Degree in Engineering",
    location: "Central Government Departments",
    vacancies: "1,765 Selected Candidates",
    applyUrl: "https://ssc.gov.in/results",
    officialNotificationUrl: "http://www.employmentnews.gov.in",
    status: "Active",
    isNew: false,
    isRead: true,
    isDemo: true,
    sourceIdentifier: "empnews-ssc-je-result-2026",
    firstDiscoveredAt: "2026-09-11T14:15:00.000Z",
    createdAt: "2026-09-11T14:15:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-demo-1",
    organization: "Staff Selection Commission (Demo)",
    title: "[DEMO] SSC CHSL 2026 — Application Form Released",
    category: "Recruitment Forms",
    description: "DEMO DATA — NOT A LIVE RECRUITMENT NOTICE: Placeholder sample for testing. Official mock portal simulation for Lower Division Clerk (LDC) and Data Entry Operator (DEO).",
    sourceName: "Demo Sample Data",
    sourceUrl: "#demo-source",
    notificationDate: "2026-09-14",
    applicationStartDate: "2026-09-01",
    applicationLastDate: "2026-10-15",
    eligibility: "DEMO DATA — NOT A LIVE RECRUITMENT NOTICE: 12th Standard pass, age 18-27 years.",
    qualification: "12th Pass (Demo)",
    location: "All India (Demo)",
    vacancies: "3,712 Posts (Demo)",
    applyUrl: "#demo-apply",
    officialNotificationUrl: "#demo-notice",
    status: "Active",
    isNew: true,
    isRead: false,
    isDemo: true,
    sourceIdentifier: "demo-chsl-2026",
    firstDiscoveredAt: "2026-09-14T10:00:00.000Z",
    createdAt: "2026-09-14T10:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  },
  {
    id: "notif-demo-2",
    organization: "Google India (Demo)",
    title: "[DEMO] Google India — Associate Software Engineer University Graduate 2026",
    category: "Private Jobs",
    description: "DEMO DATA — NOT A LIVE RECRUITMENT NOTICE: Placeholder sample for testing entry-level private software engineering hiring drive across Bangalore and Hyderabad.",
    sourceName: "Demo Sample Data",
    sourceUrl: "#demo-source",
    notificationDate: "2026-09-15",
    applicationStartDate: "2026-09-05",
    applicationLastDate: "2026-10-25",
    eligibility: "DEMO DATA — NOT A LIVE RECRUITMENT NOTICE: BCA / B.Tech / B.Sc 2025/2026 graduates with proficiency in Python, C++, or Java.",
    qualification: "B.Tech / BCA / B.Sc (Demo)",
    location: "Bangalore / Hyderabad / Pune (Demo)",
    vacancies: "40 Openings (Demo)",
    applyUrl: "#demo-apply",
    officialNotificationUrl: "#demo-notice",
    status: "Active",
    isNew: true,
    isRead: false,
    isDemo: true,
    sourceIdentifier: "demo-google-swe-2026",
    firstDiscoveredAt: "2026-09-15T09:30:00.000Z",
    createdAt: "2026-09-15T09:30:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z"
  }
];

