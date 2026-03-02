export type CvDetail =
  | string
  | {
      prefix?: string;
      text: string;
      url: string;
    };

export interface CvItem {
  role: string;
  organization?: string;
  date?: string;
  details?: CvDetail[];
}

export interface CvSection {
  title: string;
  items: CvItem[];
}

export const cvSections: CvSection[] = [
  {
    title: "Research Experience",
    items: [
      {
        role: "Ph.D. Researcher",
        organization: "Ghent University / VITO NV",
        date: "Oct 2023 - Present",
        details: [
          "Developing framework for clinical genomic data storage, sharing, and querying",
          "Utilization of the Solid protocol",
          "Experience with SPARQL, RDF, Linked Data, decentralized querying, and ontology definition",
        ],
      },
      {
        role: "Master's Thesis Researcher",
        organization: "Loyola",
        date: "Aug 2020 - Aug 2022",
        details: [
          "Identified and characterized novel medically relevant bacteria and bacteriophage sequences",
          "Master's thesis: Cataloguing Coliphages of the Human Urinary Microbiome",
          {
            prefix: "Primary author:",
            text: "DOI: 10.1371/journal.pone.0283930",
            url: "https://doi.org/10.1371/journal.pone.0283930",
          },
        ],
      },
      {
        role: "Putonti Lab Undergraduate Researcher",
        organization: "Loyola",
        date: "Aug 2019 - Aug 2020",
        details: [
          "Performed independent research involving prokaryotic DNA sequencing, assembly, and analysis",
          {
            prefix: "Contributing author:",
            text: "DOI: 10.1128/mSphere.00154-21",
            url: "https://doi.org/10.1128/mSphere.00154-21",
          },
        ],
      },
      {
        role: "Wolfe Lab Research Assistant",
        organization: "Loyola Stritch School of Medicine",
        date: "May 2019 - Aug 2019",
        details: [
          "Researched the variable resistance of 68 strains of bladder E. coli to bacteriophage infection",
        ],
      },
    ],
  },
  {
    title: "Professional Experience",
    items: [
      {
        role: "Adjunct Professor of Biology",
        organization: "Loyola University Chicago",
        date: "Aug 2021 - May 2023",
        details: ["Taught multiple sections of Biology Lab I and II each semester"],
      },
      {
        role: "Medical Scribe",
        organization: "University of Chicago Medical Center",
        date: "Nov 2021 - Jan 2023",
        details: ["Assisted physicians by taking notes on and charting patient visits"],
      },
    ],
  },
  {
    title: "Education",
    items: [
      {
        role: "Ghent University - Ph.D. Candidate",
        date: "October 2023 - Present",
        details: ["Doctor of Computer Science Engineering"],
      },
      {
        role: "Loyola University Chicago - Master of Science",
        date: "Aug 2020 - Aug 2022",
        details: ["GPA: 4.000 / 4.000"],
      },
    ],
  },
  {
    title: "Skills and Computational Expertise",
    items: [
      {
        role: "Programming Languages",
        details: ["Python, BASH, R, Java, JavaScript, TypeScript, HTML, CSS, Vue"],
      },
      {
        role: "Bioinformatic Tools",
        details: ["BowTie2, Kallisto, Spades, etc."],
      },
    ],
  },
  {
    title: "Additional Education",
    items: [
      {
        role: "Emerging Leaders Program",
        date: "Seminar Completion Date: 11/30/2017",
      },
    ],
  },
  {
    title: "Past Employment",
    items: [
      {
        role: "Supplementary Instructor",
        organization: "Loyola",
        date: "Jan 2020 - May 2021",
      },
    ],
  },
  {
    title: "Volunteer Experience",
    items: [
      {
        role: "Inner-City Education Hockey Coach",
        date: "Oct 2021 - Present",
      },
    ],
  },
  {
    title: "Awards",
    items: [
      {
        role: "Mulcahy Research Fellowship Award",
        date: "Aug 2020 - May 2021",
      },
    ],
  },
  {
    title: "Organizations",
    items: [
      {
        role: "Alpha Sigma Nu Jesuit Honors Society Inductee",
        date: "Oct 2019",
      },
    ],
  },
];
