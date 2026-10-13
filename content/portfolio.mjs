// Canonical portfolio copy. Both the website and the A4 version read these strings.
// Edit this file, then run `node scripts/apply-copy.mjs` (also runs before serve and PDF export).

export const portfolio = {
  identity: {
    role: "Computer Science Student at EPITA.",
    pitch: "Interested in building software, exploring technologies and solving real-world problems.",
    availability:
      "Currently seeking a six-month IT internship to strengthen technical skills and gain further professional experience.",
    email: "francesco.mok@gmail.com",
    emailHref: "mailto:francesco.mok@gmail.com",
    linkedinUrl: "https://www.linkedin.com/in/francesco-mok-74b28424b",
    linkedinLabel: "linkedin.com/in/francesco-mok-74b28424b",
    phone: "+33 7 83 24 88 24",
    phoneHref: "tel:+33783248824",
  },
  about: {
    p0: "I'm Francesco, a second-year Computer Science student at EPITA, studying in the english track. I have a passion for technology and a curiosity about how things work.",
    p1: "What I enjoy most about computer science is the opportunity to turn ideas into real projects, experiment with new technologies and find creative solutions to problems. From developing a video game during my first year to discovering the professional world at Reporters Without Borders, each experience has helped me grow both technically and personally.",
    p2: "Beyond programming, I enjoy exploring different cultures, gaming and keeping up with digital trends. I'm always eager to learn something new, challenge myself and discover where my interests in technology will take me next.",
    education:
      "EPITA is a French engineering school specialising in computer science and digital technologies. Its curriculum combines strong foundations in programming, mathematics and algorithms with practical projects, teamwork and problem-solving, preparing students for careers in software engineering and emerging technologies.",
    institution: "EPITA",
    programme: "Second-year Computer Engineering, Preparatory cycle (english track)",
    nationality: "French",
    age: "19 years old",
  },
  skills: {
    cloudNote: "(Salesforce Tools / SOQL)",
    professional: [
      {
        name: "Critical Thinking",
        text: "Analytical approach to technical challenges and problem solving.",
      },
      {
        name: "Autonomy",
        text: "Ability to organise tasks and progress independently.",
      },
      {
        name: "Professionalism",
        text: "Respect for responsibilities, deadlines and professional working practices.",
      },
      {
        name: "Teamwork",
        text: "Experience collaborating in academic and professional environments.",
      },
      {
        name: "Patience",
        text: "Persistence when facing technical challenges.",
      },
      {
        name: "Time Management",
        text: "Ability to prioritise tasks, organise work and meet project deadlines",
      },
    ],
    languages: [
      { name: "French", level: "Native" },
      { name: "English", level: "B2" },
      { name: "Spanish", level: "B1" },
    ],
  },
  minotaur: {
    kicker: "Academic Game Development Project",
    title: "The Minotaur Project",
    summary:
      "The Minotaur Project is a 2D single-player or multiplayer game inspired by the myth of Theseus and the Minotaur. Players enter a dangerous labyrinth and must find their way to the exit while avoiding the Minotaur. The game combines exploration, strategic decision-making and survival mechanics.",
    context: "First-year EPITA project involving the development of a 2D video game inspired by Greek mythology.",
    contribution:
      "Creation of the game's promotional website using HTML and CSS, developed without website-building tools.",
    developed: [
      "Website : Building the promotional website without a site generator meant working directly with page structure and CSS layout, alongside a Python game developed for a first-year EPITA project. I also learned how to use Git for version control and how to deploy a website.",
      "Game Development : Programmed interactive items, traps and various gameplay mechanics to enhance the player experience.",
      "Technical Documentation: Developed formal writing skills through the preparation of project reports and technical documentation.",
    ],
    websiteUrl: "https://lolympe-minotaur-project.neocities.org/",
    presentationUrl: "https://lolympe-minotaur-project.neocities.org/project.html",
  },
  rsf: {
    period: "July 2026 - August 2026",
    summary:
      "First-year IT internship at Reporters Without Borders, in collaboration with Salesforce. The main objective was to support the organisation and improvement of data-management processes.",
    developed: [
      {
        name: "Data Management",
        kind: "Technical skill",
        text: "Experience organising, filtering and cleaning professional database information using Salesforce tools. Introduction to SOQL and AI technologies.",
      },
      {
        name: "Team Collaboration",
        kind: "Behavioural skill",
        text: "Collaboration with professionals from different departments. Contribution to shared objectives and adaptation to team requirements.",
      },
      {
        name: "Professional Communication",
        kind: "Transferable skill",
        text: "Regular participation in weekly meetings. Development of clear professional communication and progress reporting.",
      },
    ],
    result:
      "Development of practical experience in IT, Salesforce and data management within a professional organisation.",
    volunteer:
      "Continued involvement with Reporters Without Borders as a volunteer, with activities planned until February 2027.",
  },
  prior: [
    {
      period: "June 2023",
      title: "Grocery Store Internship",
      text: "Collaborated with colleagues on daily operations and customer service, strengthening teamwork, organisation and reliability.",
      tags: "Teamwork · Organisation · Customer Service",
    },
    {
      period: "May 2022",
      title: "City Hall Observation Internship",
      text: "Observed public service operations and administrative procedures, gaining insight into local government and electoral processes.",
      tags: "Public Administration · Observation · Civic Awareness",
    },
  ],
  interests: [
    {
      title: "Cultural Heritage & Gastronomy",
      text: "Interest in Cambodian heritage and world cultures, especially their history, traditions and gastronomy. Particular curiosity about Southeast Asian culinary techniques.",
    },
    {
      title: "Gaming & Theorycrafting",
      text: "Strong interest in Pokémon, game mechanics, statistical optimisation and competitive strategy. Enjoyment of analysing game systems and developing effective strategies.",
    },
    {
      title: "Digital Culture & Visual Design",
      text: "Interest in digital trends and social-media recommendation algorithms, particularly YouTube and TikTok. Appreciation for modern fashion, visual aesthetics and contemporary design.",
    },
  ],
  goals: [
    {
      title: "Short-Term Goal",
      text: "Secure a six-month internship in IT to apply academic knowledge, develop technical skills and gain professional experience.",
    },
    {
      title: "Technical Development",
      text: "Continue strengthening programming skills in Python and C. Expand knowledge of software engineering, data technologies and cloud computing.",
    },
    {
      title: "Professional Exploration",
      text: "Identify a future specialisation based on practical experience and personal interests possibly in AI / Cybersecurity / Data Science.",
    },
  ],
};

export function lookup(path) {
  const value = path.split(".").reduce((current, key) => current?.[key], portfolio);
  if (typeof value !== "string") {
    throw new Error(`Portfolio copy "${path}" is not a string.`);
  }
  return value;
}
