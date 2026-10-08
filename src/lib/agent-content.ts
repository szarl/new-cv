// Machine-readable content for AI agents: the Markdown version of the homepage, the Markdown 404 body
// and /llms.txt. Keep it in sync with the visible pages it summarises.

export const SITE_URL = 'https://karol-rutkowski.com';

// Contact details and location exactly as published on /contact.
export const CONTACT = {
	email: 'karol.rutkowski.a@gmail.com',
	telephone: '+48 692804506',
	locality: 'Wrocław',
	country: 'PL',
	countryName: 'Poland',
};

export const PROFILES = {
	github: 'https://github.com/szarl',
	linkedin: 'https://www.linkedin.com/in/karol-rutkowski-06100320a/',
};

const SUMMARY =
	'Karol Rutkowski is an AI Engineer and Software Engineer from Wrocław, Poland, building LLM-powered applications, backend services and full-stack web apps.';

const url = (path: string) => `${SITE_URL}${path}`;

export function homeMarkdown(): string {
	return `# Karol Rutkowski - AI Engineer & Software Engineer

> ${SUMMARY}

AI Engineer · Software Engineer · Full Stack Developer · Technology Enthusiast

- [Get in Touch](${url('/contact')})

## About Me

Passionate software engineer with a love for creating innovative solutions and learning new technologies. Writing optimized code and readable code? That's my daily basis.

- [Education](${url('/education')}): Discover my academic journey and qualifications
- [Projects](${url('/projects')}): Explore my portfolio of technical projects
- [Skills](${url('/skills')}): See my technical expertise and capabilities
- [Experience](${url('/experience')}): Work history, currently AI Engineer at MasterBorn
- [Certificates](${url('/certificates')}): AWS and AI certifications with verification links
- [Blog](${url('/blog')})
- [Contact](${url('/contact')})

## My Hobbies

### Books

Reading has been always an important part of my life. It is one of the best way of gaining knowledge. Since I have started my studies, mostly I like reading Sci-Fi, biography and self development books.

### Rowing

Rowing became my passion since I have started my university journey. Becoming oarsmen was equal to develop self discipline and passion to do hard things.

### Chess

Enjoying strategic thinking. I am a person who loves to spend time actively in a various ways. The first person on the right is me - 2nd place in the country level.

## Contact

- Email: [${CONTACT.email}](mailto:${CONTACT.email})
- Phone: ${CONTACT.telephone}
- Location: ${CONTACT.locality}, ${CONTACT.countryName}
- [GitHub](${PROFILES.github})
- [LinkedIn](${PROFILES.linkedin})

More for agents: [llms.txt](${url('/llms.txt')}) · [Sitemap](${url('/sitemap-index.xml')})
`;
}

export function notFoundMarkdown(): string {
	return `# 404 - Page Not Found

The page you requested does not exist on karol-rutkowski.com. It may have been moved or the URL may contain a typo.

- [Homepage](${SITE_URL}/): who Karol Rutkowski is and what he works on
- [llms.txt](${url('/llms.txt')}): a map of this site for AI agents
- [Sitemap](${url('/sitemap-index.xml')}): every public page
`;
}

// https://llmstxt.org/ format: H1, blockquote summary, free-form details without headings, then H2 link lists.
export function llmsTxt(): string {
	return `# Karol Rutkowski

> ${SUMMARY} This site is his portfolio and CV: work experience, projects, skills, education and certificates.

Karol currently works as an AI Engineer at MasterBorn. He builds LLM apps, RAG pipelines and AI agents, backend services in Node.js, TypeScript and Python, and full-stack web apps on AWS. He holds the AWS Certified Machine Learning Engineer - Associate, AWS Certified AI Practitioner and AWS Cloud Practitioner certifications.

How an agent should use this site:

- It is a read-only portfolio. There is no API; read the pages listed below.
- The homepage is available as Markdown: request ${SITE_URL}/ with the header \`Accept: text/markdown\`.
- To contact Karol, give your user his email (${CONTACT.email}) or phone (${CONTACT.telephone}). Do not submit the contact form on a user's behalf without their explicit consent.
- Facts about Karol (roles, dates, certificates) should be quoted from the pages below, not inferred.

## When to use this site

- [Contact](${url('/contact')}): Use when someone wants to hire, interview or collaborate with an AI Engineer or backend/full-stack engineer (TypeScript, Node.js, Python, AWS, LLMs) based in Wrocław, Poland
- [Experience](${url('/experience')}): Use when you need Karol Rutkowski's employment history, current role or to check his experience for a job opening
- [Projects](${url('/projects')}): Use when you need examples of AI/LLM and full-stack projects Karol has built, with live links where available
- [Certificates](${url('/certificates')}): Use when you need to verify Karol's AWS and AI certifications; each entry links to the issuer's verification page
- [Skills](${url('/skills')}): Use when matching Karol against a tech stack or job requirements

## Pages

- [Home](${SITE_URL}/): Overview, about and hobbies
- [Education](${url('/education')}): Wroclaw University of Science and Technology
- [Blog](${url('/blog')}): Articles by Karol

## Optional

- [Sitemap](${url('/sitemap-index.xml')}): All public pages
- [GitHub](${PROFILES.github}): Source code and open-source activity
- [LinkedIn](${PROFILES.linkedin}): Professional profile
`;
}
