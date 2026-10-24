"""
CareerSphere - Canonical Enterprise Companies Registry
Master registry of top enterprise technology employers.
These companies must ALWAYS remain visible in the Corporate directory
regardless of current vacancy count, adhering strictly to the Rule of Truth.
"""

ENTERPRISE_COMPANIES = [
    {
        "id": "tcs",
        "name": "Tata Consultancy Services (TCS)",
        "shortName": "TCS",
        "aliases": ["tcs", "tata consultancy services", "tata group"],
        "logo": "🏛️",
        "industry": "IT Services & Consulting",
        "headquarters": "Mumbai, India",
        "officialCareerUrl": "https://www.tcs.com/careers",
        "description": "Global leader in IT services, consulting & business solutions with large-scale graduate and fresher recruitment drives."
    },
    {
        "id": "infosys",
        "name": "Infosys",
        "shortName": "Infosys",
        "aliases": ["infosys", "infosys limited", "infosys bpm"],
        "logo": "🏢",
        "industry": "IT Services & Consulting",
        "headquarters": "Bengaluru, India",
        "officialCareerUrl": "https://www.infosys.com/careers/",
        "description": "Global leader in next-generation digital services and consulting, enabling clients in more than 56 countries to navigate digital transformation."
    },
    {
        "id": "wipro",
        "name": "Wipro",
        "shortName": "Wipro",
        "aliases": ["wipro", "wipro technologies", "wipro limited"],
        "logo": "🏢",
        "industry": "IT Services & Consulting",
        "headquarters": "Bengaluru, India",
        "officialCareerUrl": "https://careers.wipro.com/",
        "description": "Leading technology services and consulting company focused on building innovative solutions addressing enterprise digital transformation."
    },
    {
        "id": "accenture",
        "name": "Accenture",
        "shortName": "Accenture",
        "aliases": ["accenture", "accenture india"],
        "logo": "🏢",
        "industry": "Management & Tech Consulting",
        "headquarters": "Dublin, Ireland / Pan India Delivery",
        "officialCareerUrl": "https://www.accenture.com/in-en/careers",
        "description": "Global professional services company with leading capabilities in digital, cloud, security, and enterprise engineering solutions."
    },
    {
        "id": "cognizant",
        "name": "Cognizant",
        "shortName": "Cognizant",
        "aliases": ["cognizant", "cognizant technology solutions"],
        "logo": "🏢",
        "industry": "IT & Digital Engineering",
        "headquarters": "Teaneck, NJ / Chennai, India",
        "officialCareerUrl": "https://careers.cognizant.com/global/en",
        "description": "Engineers modern businesses by modernizing technology, reimagining processes, and transforming digital experiences."
    },
    {
        "id": "ibm",
        "name": "IBM",
        "shortName": "IBM",
        "aliases": ["ibm", "international business machines", "ibm india"],
        "logo": "🏢",
        "industry": "Cloud, AI & Enterprise Solutions",
        "headquarters": "Armonk, NY / Bengaluru, India",
        "officialCareerUrl": "https://www.ibm.com/careers",
        "description": "Pioneering technology and research enterprise advancing hybrid cloud, enterprise AI (watsonx), and mission-critical software systems."
    },
    {
        "id": "microsoft",
        "name": "Microsoft",
        "shortName": "Microsoft",
        "aliases": ["microsoft", "microsoft india", "microsoft corporation"],
        "logo": "💻",
        "industry": "Cloud, OS, AI & Software Platforms",
        "headquarters": "Redmond, WA / Hyderabad, Bengaluru, Noida",
        "officialCareerUrl": "https://careers.microsoft.com/",
        "description": "Global technology company enabling digital transformation through intelligent cloud (Azure), productivity software, and AI platforms."
    },
    {
        "id": "amazon",
        "name": "Amazon",
        "shortName": "Amazon",
        "aliases": ["amazon", "amazon india", "aws", "amazon.com"],
        "logo": "📦",
        "industry": "E-Commerce, Cloud (AWS) & AI",
        "headquarters": "Seattle, WA / Pan India Tech Hubs",
        "officialCareerUrl": "https://amazon.jobs/en/locations/india",
        "description": "Global technology giant guided by customer obsession and operational excellence across cloud infrastructure (AWS), retail, and machine learning."
    },
    {
        "id": "google",
        "name": "Google",
        "shortName": "Google",
        "aliases": ["google", "alphabet", "google india"],
        "logo": "🌐",
        "industry": "Search, Cloud, AI & Consumer Tech",
        "headquarters": "Mountain View, CA / Bengaluru, Hyderabad",
        "officialCareerUrl": "https://careers.google.com/",
        "description": "Organizes the world's information and makes it universally accessible, leading foundational advances in search, cloud computing, and artificial intelligence."
    },
    {
        "id": "capgemini",
        "name": "Capgemini",
        "shortName": "Capgemini",
        "aliases": ["capgemini", "capgemini technology services"],
        "logo": "🏢",
        "industry": "IT Consulting & Engineering",
        "headquarters": "Paris, France / Pan India Delivery",
        "officialCareerUrl": "https://www.capgemini.com/careers/",
        "description": "Global leader in partnering with companies to transform and manage their business by harnessing the power of technology."
    },
    {
        "id": "deloitte",
        "name": "Deloitte",
        "shortName": "Deloitte",
        "aliases": ["deloitte", "deloitte india", "deloitte touche tohmatsu"],
        "logo": "🏢",
        "industry": "Consulting, Advisory & Tech Risk",
        "headquarters": "London, UK / Hyderabad, Bengaluru, Mumbai",
        "officialCareerUrl": "https://www2.deloitte.com/ui/en/careers/careers.html",
        "description": "Industry-leading provider of audit, consulting, tax, and advisory services to many of the world's most admired brands."
    },
    {
        "id": "hcltech",
        "name": "HCLTech",
        "shortName": "HCLTech",
        "aliases": ["hcltech", "hcl technologies", "hcl"],
        "logo": "🏢",
        "industry": "IT Infrastructure, Digital & Engineering",
        "headquarters": "Noida, India",
        "officialCareerUrl": "https://www.hcltech.com/careers",
        "description": "Global technology company supercharging progress for the world's leading enterprises through digital, engineering, and cloud capabilities."
    },
    {
        "id": "techmahindra",
        "name": "Tech Mahindra",
        "shortName": "Tech Mahindra",
        "aliases": ["tech mahindra", "tech mahindra limited", "mahindra tech"],
        "logo": "🏢",
        "industry": "IT Services & Telecom Solutions",
        "headquarters": "Pune, India",
        "officialCareerUrl": "https://careers.techmahindra.com/",
        "description": "Offers innovative and customer-centric digital experiences, enabling enterprises, associates, and society to Rise."
    }
]

import re

def company_matches_aliases(company_name, aliases):
    """Accurately checks if a company string matches a list of aliases with word boundary support for short acronyms."""
    if not company_name or not aliases:
        return False
    c_lower = company_name.lower().strip()
    for alias in aliases:
        a_lower = alias.lower().strip()
        if len(a_lower) <= 4:
            if re.search(r'\b' + re.escape(a_lower) + r'\b', c_lower):
                return True
        else:
            if a_lower in c_lower:
                return True
    return False

def get_enterprise_companies():
    """Returns a copy of the canonical enterprise companies list."""
    return [dict(c) for c in ENTERPRISE_COMPANIES]

def find_company_by_alias(company_name):
    """Matches an incoming raw company name against the canonical 13 enterprises."""
    if not company_name:
        return None
    for comp in ENTERPRISE_COMPANIES:
        if company_matches_aliases(company_name, comp["aliases"]):
            return comp
    return None

