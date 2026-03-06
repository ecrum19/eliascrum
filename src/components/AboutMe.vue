<template>
  <div
    id="introduction"
    class="w3-content w3-margin-top"
    style="max-width: 1400px"
  >
    <div id="entry" class="w3-row-padding">
      <!-- Left Column -->
      <div class="w3-third">
        <div id="genInfo" class="w3-card-4">
          <div class="w3-container">
            <p>
              <a
                href="https://research.ugent.be/web/person/elias-david-crum-0/en"
              >
                <i
                  class="fa fa-briefcase fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"
                ></i
                >Ph.D. Candidate</a
              >
            </p>
            <p>
              <a href="https://www.google.com/maps/place/Ghent">
                <i
                  class="fa fa-map-marker fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"
                ></i
                >Ghent, BE</a
              >
            </p>
            <p>
              <a href="mailto:elias.crum@ugent.be">
                <i
                  class="fa fa-envelope fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"
                ></i
                >elias.crum@ugent.be</a
              >
            </p>
            <hr />

            <p class="w3-large">
              <b
                ><i
                  class="fa fa-globe fa-fw w3-xlarge w3-margin-right w3-text-white"
                ></i
                >Affiliations</b
              >
            </p>
            <ul id="orgs">
              <li>
                <a href="https://www.fwo.be/en/about-fwo/">
                  <img
                    src="./assets/Logo_(FWO).png"
                    alt="Research Foundation - Flanders (FWO)"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.ugent.be/en"
                  ><img class="ugent-logo" src="./assets/logo_UGent_white.png" alt="Ghent University"
                /></a>
              </li>
              <li>
                <a href="https://knows.idlab.ugent.be/"
                  ><img
                    src="./assets/KNoWS_logo.png"
                    alt="KNowledge on the Web Scale (KNoWS)"
                /></a>
              </li>
              <li>
                <a href="https://vito.be/en"
                  ><img src="./assets/vito-logo_white_blue_background_1.png" alt="VITO NV"
                /></a>
              </li>
            </ul>

            <hr />

            <p class="w3-large">
              <b
                ><i
                  class="fa fa-graduation-cap fa-fw w3-xlarge w3-margin-right w3-text-white"
                ></i
                >Research Topics</b
              >
            </p>
            <ul id="keywords">
              <li>Clinical Genomics</li>
              <li>Knowledge Representation</li>
              <li>Semantic Web</li>
              <li><a href="https://solidproject.org/">Solid</a></li>
              <li>
                <a href="https://comunica.dev/">Decentralized Querying</a>
              </li>
              <li>Linked Data</li>
              <li>Knowledge Graph Generation</li>
              <li>Ontology Generation</li>
            </ul>

            <br />

            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i
                  class="fa fa-address-card fa-fw w3-xlarge w3-margin-right w3-text-white"
                ></i>
                <a
                  href="/about/cv"
                  >Curriculum Vitae</a
                ></b
              >
            </p>


            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i
                  class="fa fa-bullhorn fa-fw w3-xlarge w3-margin-right w3-text-white"
                ></i>
                <a
                  href="https://drive.google.com/drive/folders/1QWyqEYoFDszYWHMKqK-xS06cC3sy6Jbe?usp=sharing"
                  target="_blank"
                  >Presentations</a
                ></b
              >
            </p>

            <br />
          </div>
        </div>
        <br />

        <!-- End Left Column -->
      </div>

      <!-- Right Column -->
      <div class="w3-twothird">
        <div id="recentWork" class="w3-container w3-card">
          <h2 class="w3-panel" id="recentWorkTitle">Recent Work</h2>
          <div
            class="recentWorkItem"
            v-for="item in recentUpdates"
            :key="item.id"
          >
            <div class="recentWorkMeta">
              <span class="recentWorkType">{{ item.type }}</span>
              <span class="recentWorkDate">{{ item.dateLabel }}</span>
            </div>
            <h3 class="recentWorkHeading">{{ item.title }}</h3>
            <p class="recentWorkSummary">{{ item.summary }}</p>
            <a
              class="recentWorkLink"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.linkLabel }}
            </a>
          </div>
          <div v-if="recentUpdates.length === 0" class="recentWorkItem">
            <h3 class="recentWorkHeading">No Recent Work Yet</h3>
            <p class="recentWorkSummary">
              Add publication, talk, or blog entries with a valid ISO date to populate this section.
            </p>
          </div>
        </div>
        <div id="aboutMe" class="w3-container w3-card">
          <h1 class="w3-panel" id="about">About Me</h1>
          <div class="w3-container" id="intro-container">
            <body id="intro">
              I am a 1st year PhD candidate in the
              <a href="https://knows.idlab.ugent.be/"><u>KNoWS group</u></a>
              of IDLab at Ghent University and the Digital Precision Health
              group of
              <a href="https://vito.be/en/theme/sustainable-health"
                ><u>VITO NV</u></a
              >. 
              
              I funded through the <a href="https://www.fwo.be/en/support-programmes/all-calls/phd/phd-fellowship-strategic-basic-research/">
                PhD fellowship - strategic basic research</a> from the Research Foundation - Flanders (FWO).
              <br />
              <br />
              My PhD, PErsoNal Genome QUery IN health care and clinical practice
              (<i>PENGQUIN</i>), is investigating the integration of
              cutting-edge decentralized storage and semantic web technologies
              to innovate in the field of personal genomic data storage and
              usage. Specifically, I am interested in the topics of genomic data
              knowledge graph generation, data linking, ontology definition,
              data privacy policy enforcement, federated SPARQL querying, and
              scalable decentralized data storage approaches.
              <br />
              <br />
              More generally, I am passionate about building things that improve
              the world around me, especially in the realms of genomics and
              healthcare.
            </body>
          </div>
        </div>
      </div>
      <!-- End Right Column -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getRecentHomepageUpdates, type HomepageUpdate } from "../data/homepageUpdates";

export default defineComponent({
  name: "AboutMe",
  computed: {
    recentUpdates(): HomepageUpdate[] {
      return getRecentHomepageUpdates(1);
    },
  },
});
</script>

<style>
#introduction {
  font-size: 16pt;
}

#aboutMe {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  align-items: center;
}

#recentWork {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  align-items: center;
  margin-bottom: 16px;
}

#recentWorkTitle {
  background: transparent;
  color: var(--page-text);
  margin: 10px 0 4px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.recentWorkItem {
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid rgba(80, 203, 255, 0.58);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

[data-theme="light"] .recentWorkItem {
  background: rgba(16, 36, 59, 0.06);
  border-left-color: rgba(13, 79, 136, 0.55);
}

.recentWorkMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.recentWorkType,
.recentWorkDate {
  font-size: 0.9rem;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 2px 10px;
}

.recentWorkHeading {
  margin: 0;
  color: var(--page-text);
  font-size: 1.2rem;
}

.recentWorkSummary {
  margin: 8px 0 0;
  line-height: 1.45;
}

.recentWorkLink {
  display: inline-block;
  margin-top: 10px;
  font-weight: 700;
}

#entry {
  color: var(--page-text);
  background: transparent;
}

a {
  text-decoration: none;
}

#entry a {
  color: var(--link-color);
}

#genInfo {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  padding-top: 5%;
  font-size: 1.12rem;
}

#genInfo i.w3-text-white {
  color: var(--page-text) !important;
}

#genInfo p {
  font-size: 1.12rem;
  line-height: 1.45;
}

#genInfo p.w3-large {
  font-size: 1.28rem !important;
}

#about {
  background: transparent;
  color: var(--page-text);
  margin-top: 10px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

#intro {
  font-size: 22pt;
  font-family: "KoHo", sans-serif;
  background: transparent;
  color: var(--page-text);
}

#intro-container {
  margin-bottom: 10px;
  padding-bottom: 23px;
}

#keywords {
  font-size: 1.08rem;
  line-height: 1.5;
  margin-left: 30px;
}

#keywords li {
  margin-bottom: 4px;
}

#orgs {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
#orgs li {
  flex: 0 0 48%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}
#orgs li img {
  width: 100px;
  height: auto;
}

.ugent-logo {
  filter: none;
}

[data-theme="light"] .ugent-logo {
  filter: brightness(0) saturate(100%) invert(21%) sepia(74%) saturate(1841%)
    hue-rotate(192deg) brightness(96%) contrast(91%);
}

div.school {
  background: var(--surface-bg);
  position: flex;
  top: 0px;
  left: 550px;
  opacity: 0.8;
  outline: 2px solid var(--surface-outline);
  width: 40%;
  padding: 2%;
}
</style>
