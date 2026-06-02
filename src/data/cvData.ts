export type CvDetail =
  | string
  | {
      prefix?: string;
      text: string;
      url: string;
      internal?: boolean;
    };

export interface CvContact {
  label: string;
  value: string;
  href: string;
  icon: string;
}

export interface CvArtifact {
  label: string;
  path: string;
}

export interface CvProfile {
  name: string;
  headline: string;
  address: string;
  focusTags: string[];
  contacts: CvContact[];
}

export interface CvItem {
  role: string;
  organization?: string;
  location?: string;
  date?: string;
  details?: CvDetail[];
  group?: string;
  artifacts?: CvArtifact[];
}

export interface CvSection {
  title: string;
  layout?: "timeline" | "skills" | "awards";
  items: CvItem[];
}

export const cvProfile: CvProfile = {
  name: "Elias D. Crum",
  headline: "Doctor of Computer Science Engineering PhD Candidate · Bioinformatician",
  address: "AA Tower, Floor 7, Technologiepark-Zwijnaarde 122, Gent 9052, Belgium",
  focusTags: [
    "Clinical Genomics",
    "Bioinformatics",
    "Semantic Web",
    "SPARQL",
    "RDF",
    "Solid",
  ],
  contacts: [
    {
      label: "Email",
      value: "elias.crum@ugent.be",
      href: "mailto:elias.crum@ugent.be",
      icon: "fa-envelope",
    },
    {
      label: "GitHub",
      value: "github.com/ecrum19",
      href: "https://github.com/ecrum19",
      icon: "fa-github",
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/elias-crum-413178142",
      href: "https://www.linkedin.com/in/elias-crum-413178142/",
      icon: "fa-linkedin",
    },
  ],
};

export const cvSections: CvSection[] = [
  {
    title: "Education",
    layout: "timeline",
    items: [
      {
        organization: "Ghent University",
        role: "Doctor of Computer Science Engineering",
        location: "Gent, Belgium",
        date: "Oct. 2023 - Present",
        details: [
          "KNowledge on Web Scale (IDLab, UGent) / Digital Precision Health (VITO NV)",
        ],
      },
      {
        organization: "Loyola University Chicago",
        role: "Master of Science (Bioinformatics)",
        location: "Chicago, IL, USA",
        date: "Aug. 2020 - Aug. 2022",
        details: [
          "Graduated with Bioinformatics Honors",
          "GPA: 4.00 / 4.00",
        ],
      },
      {
        organization: "Loyola University Chicago",
        role: "Bachelor of Science",
        location: "Chicago, IL, USA",
        date: "Aug. 2017 - May 2021",
        details: [
          "Majors: Bioinformatics and Biology",
          "Minor: History",
          "GPA: 3.991 / 4.000",
        ],
      },
    ],
  },
  {
    title: "Skills",
    layout: "skills",
    items: [
      {
        role: "Programming Languages",
        details: ["Python, BASH, R, Java, JavaScript, TypeScript, HTML, CSS, Vue, LaTeX"],
      },
      {
        role: "Bioinformatics Tools",
        details: ["BowTie2, Kallisto, Spades, FastANI, PATRIC, PHASTER, Anvi'o, ResFinder, BLAST+, Clustal Omega, and related tooling"],
      },
      {
        role: "Miscellaneous",
        details: ["GitHub Actions, NGINX, Conda, Docker, Cytoscape"],
      },
      {
        role: "Semantic Web",
        details: ["SPARQL, RDF serialization, ontology definition, Solid"],
      },
      {
        role: "Languages",
        details: ["English (native), Dutch (A1), French (A2)"],
      },
    ],
  },
  {
    title: "Honors and Awards",
    layout: "awards",
    items: [
      {
        group: "Graduate Education",
        date: "2024-28",
        role: "Strategic Basic PhD Fellowship Awardee",
        organization: "The Research Foundation - Flanders (FWO)",
        location: "Brussels, Belgium",
        details: [
          {
            prefix: "Details:",
            text: "FWO Fellowship Record",
            url: "/about/fellowships/fwo-phd-fellowship",
            internal: true,
          },
        ],
      },
      {
        group: "Graduate Education",
        date: "2026",
        role: "AIbare Award",
        organization: "SWAT4HCLS 2026",
        location: "Amsterdam, The Netherlands",
        details: [
          {
            prefix: "Publication:",
            text: "From VCF to RDF: RML-Based Conversion Approaches for the Semantic Representation of Variant Data",
            url: "/publications/vcf-to-rdf-rml-swat4hcls-2026/paper",
            internal: true,
          },
        ],
        artifacts: [
          {
            label: "AIbare Award Certificate",
            path: "/cv/artifacts/swat4hcls26-aibare-award-certificate.pdf",
          },
        ],
      },
      {
        group: "Graduate Education",
        date: "2024",
        role: "Best Paper (Group)",
        organization: "International Semantic Web Summer School 2024",
        location: "Bertinoro, Italy",
        details: [
          {
            prefix: "Slides:",
            text: "ISWS 2024 Group Project Presentation",
            url: "/talks/isws-group-project-presentation",
            internal: true,
          },
        ],
        artifacts: [
          {
            label: "Best Paper Certificate",
            path: "/cv/artifacts/isws24-best-paper-certificate.pdf",
          },
        ],
      },
      {
        group: "Graduate Education",
        date: "2024",
        role: "Best Poster (Individual)",
        organization: "International Semantic Web Summer School 2024",
        location: "Bertinoro, Italy",
        details: [
          {
            prefix: "Poster:",
            text: "ISWS 2024 Award-Winning Poster (PENGQUIN)",
            url: "/talks/posters/edc-poster-isws2024-award-winner",
            internal: true,
          },
        ],
        artifacts: [
          {
            label: "Best Poster Certificate",
            path: "/cv/artifacts/isws24-best-poster-certificate.pdf",
          },
        ],
      },
      {
        group: "Pre-Graduate Education",
        date: "2020-21",
        role: "Mulcahy Research Fellowship Award",
        organization: "Recipient of a research scholarship for the 2020-2021 school year",
        location: "Chicago, IL, USA",
      },
      {
        group: "Pre-Graduate Education",
        date: "2017-21",
        role: "College of Arts and Sciences Dean's List Mention",
        organization: "Eight-time Dean's List recipient",
        location: "Chicago, IL, USA",
      },
      {
        group: "Pre-Graduate Education",
        date: "2017-18",
        role: "Employee of the Year",
        organization: "Campus Recreation, Loyola University Chicago",
        location: "Chicago, IL, USA",
      },
      {
        group: "Pre-Graduate Education",
        date: "2017-21",
        role: "Presidential Scholarship Recipient",
        organization: "College of Arts and Sciences, Loyola University Chicago",
        location: "Chicago, IL, USA",
      },
    ],
  },
  {
    title: "Research Experience",
    layout: "timeline",
    items: [
      {
        organization: "Graduate Researcher, Ghent University & VITO NV",
        role: "Ph.D. Candidate",
        location: "Ghent, Belgium",
        date: "Oct. 2023 - Present",
        details: [
          "Developing framework for clinical genomic data storage, sharing, and querying.",
          "Implementation of the framework utilizes the Solid protocol.",
          "Experience with SPARQL, RDF, Linked Data, decentralized querying, and ontology definition.",
        ],
      },
      {
        organization: "Master's Research, Loyola University Chicago (Putonti Lab)",
        role: "Master's Researcher",
        location: "Chicago, IL, USA",
        date: "Aug. 2020 - Aug. 2022",
        details: [
          "Identified and characterized novel, medically relevant bacteria and bacteriophage sequences.",
          "Master's thesis: Cataloguing Coliphages of the Human Urinary Microbiome.",
          "Experience with gene annotation and clustering, taxonomic classification screening, and gene-similarity network production.",
          {
            prefix: "Publication:",
            text: "10.1371/journal.pone.0283930",
            url: "/publications/urinary-coliphages-2023/paper",
            internal: true,
          },
        ],
      },
      {
        organization: "Undergraduate Research, Loyola University Chicago (Putonti Lab)",
        role: "Undergraduate Researcher",
        location: "Chicago, IL, USA",
        date: "Aug. 2019 - Aug. 2020",
        details: [
          "Performed independent research involving prokaryotic DNA sequencing, assembly, and analysis.",
          {
            prefix: "Publication:",
            text: "10.1128/mSphere.00154-21",
            url: "/publications/gardnerella-characterization-2021/paper",
            internal: true,
          },
        ],
      },
      {
        organization: "Junior Researcher, Loyola Stritch School of Medicine (Wolfe Lab)",
        role: "Junior Research Assistant",
        location: "Chicago, IL, USA",
        date: "May 2019 - Aug. 2019",
        details: [
          "Researched the variable resistance of strains of bladder E. coli to bacteriophage infection.",
          "Presented the outcomes of this work to the Stritch School of Medicine Microbiology and Immunology Department.",
          "Presented a poster at the Stritch School of Medicine annual St. Albert's Day Research Celebration.",
        ],
      },
    ],
  },
  {
    title: "Professional Experience",
    layout: "timeline",
    items: [
      {
        organization: "Department of Biology, Loyola University Chicago",
        role: "Adjunct Professor of Biology",
        location: "Chicago, IL, USA",
        date: "Aug. 2021 - May 2023",
        details: [
          "Taught two sections of Biology Lab I and II each semester, with 24 students per section.",
          "Designed and delivered lectures, assessed in-class exercises, and developed and evaluated quizzes and exams.",
          "Collaborated with colleagues and students to maximize student learning and growth.",
        ],
      },
      {
        organization: "Emergency Department, University of Chicago Medical Center",
        role: "Medical Scribe",
        location: "Chicago, IL, USA",
        date: "Nov. 2021 - Jan. 2023",
        details: [
          "Assisted physicians by taking notes on and charting patient visits.",
          "Interpreted and integrated medical charts to aid in the diagnosis and treatment of patients.",
          "Operated EPIC software for medical documentation.",
        ],
      },
      {
        organization: "Tutoring Center, Loyola University Chicago",
        role: "Training and Professional Development Committee Member",
        location: "Chicago, IL, USA",
        date: "Nov. 2020 - May 2021",
        details: [
          "Trained incoming student tutors and supplementary instructors.",
          "Supervised peer leaders and provided constructive feedback on instruction.",
          "Led group discussions and presented during bi-weekly meetings of more than 100 tutors.",
        ],
      },
      {
        organization: "Tutoring Center, Loyola University Chicago",
        role: "Supplementary Instructor (SI) and Group Tutor",
        location: "Chicago, IL, USA",
        date: "Jan. 2019 - May 2021",
        details: [
          "Tutored and served as professor's assistant for Pre-calculus (MATH 117) and Organic Chemistry I and II (CHEM 223 and 224).",
          "Attended lectures and aided professors with lessons for around 200 students.",
          "Hosted three tutoring sessions per week with an average attendance between 20 and 80 students.",
          "Tutored students in accelerated summer science courses including General Biology, Cell Biology, Genetics, General Chemistry, Organic Chemistry, Biochemistry, and Physics.",
        ],
      },
      {
        organization: "Campus Recreation, Loyola University Chicago",
        role: "Intramural Sports Official",
        location: "Chicago, IL, USA",
        date: "Sept. 2017 - May 2019",
        details: [
          "Refereed intramural sports including flag football, soccer, and volleyball.",
          "Communicated with other officials and players to ensure a fair and enjoyable intramural atmosphere.",
          "Diffused conflicts arising during or after games.",
          "Earned Campus Recreation Employee of the Year for the 2017-2018 academic year.",
        ],
      },
    ],
  },
  {
    title: "Professional Development",
    layout: "timeline",
    items: [
      {
        organization: "International Semantic Web Summer School 2024",
        role: "Participant",
        location: "Bertinoro, Italy",
        date: "2024",
        details: [
          "Participated in the 2024 International Semantic Web Summer School and related project activities.",
        ],
        artifacts: [
          {
            label: "Participation Certificate",
            path: "/cv/artifacts/isws24-participation-certificate.pdf",
          },
        ],
      },
    ],
  },
  {
    title: "Volunteer Experience",
    layout: "timeline",
    items: [
      {
        organization: "Inner City Education (ICE) Program",
        role: "Ice Hockey and Skating Coach",
        location: "Chicago, IL, USA",
        date: "Oct. 2021 - Apr. 2023",
        details: [
          "Coached underprivileged inner-city children in the fundamentals of skating and ice hockey.",
          "Taught, encouraged, and engaged with participants aged 8 to 15.",
        ],
      },
      {
        organization: "Alumni Relations, Loyola University Chicago",
        role: "Student Alumni Ambassador",
        location: "Chicago, IL, USA",
        date: "Aug. 2019 - May 2020",
        details: [
          "Attended Loyola alumni events and communicated the student experience with Loyola alumni.",
          "Worked at a diverse array of Loyola-sponsored events and acted as a representative of the university.",
        ],
      },
      {
        organization: "AMITA St. Joseph's Hospital",
        role: "Emergency Room Volunteer",
        location: "Chicago, IL, USA",
        date: "Oct. 2018 - Mar. 2020",
        details: [
          "Volunteered in the emergency room on a weekly basis.",
          "Helped restock rooms, tend to patient needs, and assist medical professionals.",
        ],
      },
      {
        organization: "Loyola4Chicago - Jordan Elementary",
        role: "Afterschool Program Tutor",
        location: "Chicago, IL, USA",
        date: "Sept. 2019 - Mar. 2020",
        details: [
          "Assisted in overseeing the afterschool homework program at Jordan Elementary for grades 3 and 4.",
          "Helped keep around 20 students focused while assisting with homework and occasional enrichment activities.",
        ],
      },
      {
        organization: "St. Paul Police PAL - Learn to Skate Program",
        role: "Assistant Skating Instructor",
        location: "St. Paul, MN, USA",
        date: "Nov. 2015 - Mar. 2020",
        details: [
          "Instructed underprivileged inner-city children in the fundamentals of skating and ice hockey.",
          "Assisted St. Paul Police officers with program coordination and participant organization.",
        ],
      },
    ],
  },
  {
    title: "Organizations",
    layout: "awards",
    items: [
      {
        date: "2019",
        role: "Alpha Sigma Nu Jesuit Honors Society Inductee",
        organization: "Loyola University Chicago Chapter",
        location: "Chicago, IL, USA",
      },
      {
        date: "2018",
        role: "Delta Sigma Phi Fraternity",
        organization: "Epsilon Kappa Chapter, Loyola University Chicago",
        location: "Chicago, IL, USA",
      },
    ],
  },
];
