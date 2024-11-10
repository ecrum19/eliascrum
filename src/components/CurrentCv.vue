<template>
  <div
    id="introduction"
    class="w3-content w3-margin-top"
    style="max-width: 1400px"
  >
    <body>
        
      <h2>Research Experience</h2>
      <ul>
        <li>
          <strong>Ph.D. Researcher (Ghent University / VITO)</strong> | Oct 2023
          – Present
        </li>
        <ul>
          <li>
            Developing framework for clinical genomic data storage, sharing, and
            querying
          </li>
          <li>Utilization of the Solid protocol</li>
          <li>
            Experience with SPARQL, RDF, Linked Data, decentralized querying,
            and ontology definition
          </li>
        </ul>
        <li>
          <strong>Master’s Thesis Researcher (Loyola)</strong> | Aug 2020 – Aug
          2022
        </li>
        <ul>
          <li>
            Identified and characterized novel medically relevant bacteria and
            bacteriophage sequences
          </li>
          <li>
            Master’s thesis: Cataloguing Coliphages of the Human Urinary
            Microbiome
          </li>
          <li>
            Primary author:
            <a href="https://doi.org/10.1371/journal.pone.0283930"
              >DOI: 10.1371/journal.pone.0283930</a
            >
          </li>
        </ul>
        <li>
          <strong>Putonti Lab Undergraduate Researcher (Loyola)</strong> | Aug
          2019 – Aug 2020
        </li>
        <ul>
          <li>
            Performed independent research involving prokaryotic DNA sequencing,
            assembly, and analysis
          </li>
          <li>
            Contributing author:
            <a href="https://doi.org/10.1128/mSphere.00154-21"
              >DOI: 10.1128/mSphere.00154-21</a
            >
          </li>
        </ul>
        <li>
          <strong
            >Wolfe Lab Research Assistant (Loyola Stritch School of
            Medicine)</strong
          >
          | May 2019 – Aug 2019
        </li>
        <ul>
          <li>
            Researched the variable resistance of 68 strains of bladder E. coli
            to bacteriophage infection
          </li>
        </ul>
      </ul>

      <h2>Professional Experience</h2>
      <ul>
        <li>
          <strong
            >Adjunct Professor of Biology (Loyola University Chicago)</strong
          >
          | Aug 2021 – May 2023
        </li>
        <ul>
          <li>Teach two sections of Biology Lab I and II</li>
        </ul>
        <li>
          <strong>Medical Scribe (University of Chicago Medical Center)</strong>
          | Nov 2021 – Jan 2023
        </li>
        <ul>
          <li>
            Assisted physicians by taking notes on and charting patient visits
          </li>
        </ul>
      </ul>

      <h2>Education</h2>
      <ul>
        <li>
          <strong>Ghent University – Ph.D. Candidate</strong> | October 2023 -
          Present
        </li>
        <ul>
          <li>Doctor of Computer Science Engineering</li>
        </ul>
        <li>
          <strong>Loyola University Chicago – Master of Science</strong> | Aug
          2020 - Aug 2022
        </li>
        <ul>
          <li>GPA: 4.000 / 4.000</li>
        </ul>
      </ul>

      <h2>Skills and Computational Expertise</h2>
      <ul>
        <li>
          Programming Languages: Python, BASH, R, Java, JavaScript, HTML, CSS,
          Vue
        </li>
        <li>Bioinformatic tools: BowTie2, Kallisto, Spades, etc.</li>
      </ul>

      <h2>Additional Education</h2>
      <ul>
        <li>
          <strong>Emerging Leaders Program</strong> | Seminar Completion Date:
          11/30/2017
        </li>
      </ul>

      <h2>Past Employment</h2>
      <ul>
        <li>
          <strong>Supplementary Instructor (Loyola)</strong> | Jan 2020 – May
          2021
        </li>
      </ul>

      <h2>Volunteer Experience</h2>
      <ul>
        <li>
          <strong>Inner-City Education Hockey Coach</strong> | Oct 2021 –
          Present
        </li>
      </ul>

      <h2>Awards</h2>
      <ul>
        <li>
          <strong>Mulcahy Research Fellowship Award</strong> | Aug 2020 – May
          2021
        </li>
      </ul>

      <h2>Organizations</h2>
      <ul>
        <li>
          <strong>Alpha Sigma Nu Jesuit Honors Society Inductee</strong> | Oct
          2019
        </li>
      </ul>
    </body>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  methods: {},
};
</script>

<style scoped>
/* formatting the page */
body {
  width: 80%;
  height: 29.7cm;
  margin: 0 auto;
}


/* formatting the text */
.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.rightPanel {
  width: 90%;
  padding: 40px;
}

.workExperience > ul > li ul {
  padding-left: 0.5cm;
  list-style-type: disc;
  margin-top: 10px;
}
.workExperience > ul {
  list-style-type: none;
  padding-left: 0;
}
.workExperience > ul > li {
  position: relative;
  margin: 0;
  padding-bottom: 1cm;
  padding-left: 0.5cm;
}
.workExperience > ul > li:before {
  background-color: #b8abab;
  width: 0.05cm;
  content: "";
  position: absolute;
  top: 0.1cm;
  bottom: -0.2cm; /* change this after border removal */
  left: 0.05cm;
}
.workExperience > ul > li::after {
  content: "";
  position: absolute;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' viewBox='0 0 32 32' focusable='false'%3E%3Ccircle stroke='none' fill='%23484444' cx='16' cy='16' r='10'%3E%3C/circle%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  left: -0.09cm;
  top: 0;
  width: 0.35cm;
  height: 0.35cm;
}
.jobPosition {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.jobPosition span,
.projectName span {
  font-family: "Source Sans Pro", sans-serif;
}

body {
  font-family: Arial, sans-serif;

  margin-top: 30px;
}
h1 {
  font-size: 24px;
}
h2 {
  color: white;
  font-size: 20px;
  margin-top: 20px;
}
p {
  line-height: 1.6;
}
ul {
  list-style-type: none;
}
ul li {
  margin-bottom: 5px;
}
.contact-info {
  margin-bottom: 20px;
}
</style>
