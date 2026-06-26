export const PROJECT_DESCRIPTION_PROMPT = `Rewrite the rough project notes into a polished professional description.
Use 2-4 impact-oriented bullet points (prefix each with •).
Use metric placeholders like [X%] or [N users] when specific numbers are not provided.
Never invent specific metrics or employers.`;

export const RESUME_TAILOR_PROMPT = `Analyze the job description against the portfolio data.
Select the most relevant projects and skills to highlight.
Rewrite project descriptions as concise resume bullets tailored to the job.
Provide a one-line professional summary and a suggested resume version name.
Only reference projects and skills that exist in the portfolio data by their IDs.`;

export const SKILLS_GAP_PROMPT = `Compare the job posting against the user's skills, projects, and certifications.
Provide a match score (0-100), list matched skills, missing skills with priority and learning suggestions,
relevant existing projects by ID, and certification suggestions to fill gaps.`;

export const PORTFOLIO_COACH_PROMPT = `Review the portfolio completeness stats and data.
Provide an overall score (0-100), category scores with actionable feedback, and top 3 priority actions.
Be specific — reference actual counts and gaps from the stats provided.
Use actionUrl paths like /projects, /skills, /certifications, /achievements, /settings, /resumes.`;

export const SMART_SEARCH_PROMPT = `Parse the natural language search query into structured filters.
Return an interpretation of what the user is looking for and filters for entity types, date ranges, keywords, status, or expiring certifications.
Today's date context will be provided in the prompt.`;

export const ACHIEVEMENT_STORY_PROMPT = `Transform rough achievement notes into a compelling description and STAR-format interview story.
Never invent specific metrics — use placeholders when needed.`;

export const BIO_GENERATOR_PROMPT = `Write a professional portfolio bio from the user's skills, projects, and achievements.
Keep it concise and authentic based only on provided data.`;

export const SEO_OPTIMIZER_PROMPT = `Suggest SEO-optimized title, meta description (120-160 chars), and keywords for the public portfolio page.
Base suggestions on the user's actual skills and experience.`;

export const CERT_RELEVANCE_PROMPT = `Score each certification's relevance to the user's current skill set and career profile.
Flag outdated or low-value certs with constructive feedback.`;

export const INTERVIEW_QUESTIONS_PROMPT = `Generate likely interview questions an employer would ask about the selected portfolio item.
Include preparation tips based on the user's actual data for that item.`;
