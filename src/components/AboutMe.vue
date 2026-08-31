<template>
  <div
    id="introduction"
    class="w3-content w3-margin-top"
    style="max-width: min(1640px, 97vw)"
  >
    <div id="entry" class="w3-row-padding">
      <!-- Left Column -->
      <div class="w3-third">
        <div id="genInfo" class="w3-card-4">
          <div class="w3-container">
            <div class="home-contact-list">
              <p class="home-contact-row">
                <a
                  class="home-contact-link"
                  href="https://research.ugent.be/web/person/elias-david-crum-0/en"
                >
                  <i
                    class="home-contact-icon fa fa-briefcase fa-fw w3-xlarge w3-text-white w3-hover-opacity"
                  ></i>
                  <span>Ph.D. Candidate</span>
                </a>
              </p>
              <p class="home-contact-row">
                <a class="home-contact-link" href="https://www.google.com/maps/place/Ghent">
                  <i
                    class="home-contact-icon fa fa-map-marker fa-fw w3-xlarge w3-text-white w3-hover-opacity"
                  ></i>
                  <span>Ghent, BE</span>
                </a>
              </p>
              <p class="home-contact-row">
                <a class="home-contact-link" href="mailto:elias.crum@ugent.be">
                  <i
                    class="home-contact-icon fa fa-envelope fa-fw w3-xlarge w3-text-white w3-hover-opacity"
                  ></i>
                  <span>elias.crum@ugent.be</span>
                </a>
              </p>
              <p class="home-contact-row">
                <router-link class="home-contact-link" to="/about/cv">
                  <i
                    class="home-contact-icon fa fa-address-card fa-fw w3-xlarge w3-text-white w3-hover-opacity"
                  ></i>
                  <span>Curriculum Vitae</span>
                </router-link>
              </p>
            </div>
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

            <section class="home-sidebar-section">
              <div class="home-sidebar-section-head">
                <p class="w3-large home-sidebar-section-title">
                  <b
                    ><i
                      class="fa fa-book fa-fw w3-xlarge w3-margin-right w3-text-white"
                    ></i
                    >Research Profiles</b
                  >
                </p>
              </div>
              <div class="home-profile-links">
                <a
                  v-for="profile in publicationProfileLinks"
                  :key="profile.id"
                  class="home-profile-link"
                  :class="`home-profile-link-${profile.variant}`"
                  :href="profile.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="profile.label"
                  :title="profile.label"
                >
                  <img class="home-profile-icon" :src="profile.iconUrl" alt="" />
                </a>
              </div>
            </section>

            <hr />

            <section class="home-sidebar-section">
              <div class="home-sidebar-section-head">
                <p class="w3-large home-sidebar-section-title">
                  <b
                    ><i
                      class="fa fa-graduation-cap fa-fw w3-xlarge w3-margin-right w3-text-white"
                    ></i
                    >Research Topics</b
                  >
                </p>
                <p class="home-sidebar-section-copy">
                  Browse the site by recurring research themes across publications and talks.
                </p>
              </div>
              <div id="keywords" class="home-topic-tags">
                <component
                  v-for="topic in researchTopicLinks"
                  :key="topic.label"
                  :is="topic.external ? 'a' : 'router-link'"
                  class="home-topic-tag"
                  :class="[
                    `home-topic-tag-${topic.variant}`,
                    topic.external ? 'home-topic-tag-external' : 'home-topic-tag-internal',
                  ]"
                  :data-destination="topic.destination"
                  :to="topic.external ? undefined : topic.to"
                  :href="topic.external ? topic.href : undefined"
                  :target="topic.external ? '_blank' : undefined"
                  :rel="topic.external ? 'noopener noreferrer' : undefined"
                >
                  {{ topic.label }}
                </component>
              </div>
            </section>

          </div>
        </div>
        <br />

        <!-- End Left Column -->
      </div>

      <!-- Right Column -->
      <div class="w3-twothird">
        <div id="recentWork" class="w3-container w3-card">
          <div id="recentWorkHeader">
            <div class="recentWorkTitleBlock">
              <span class="recentWorkEyebrow">Latest Highlight</span>
            </div>
          </div>
          <p class="recentWorkIntro">
            Most recent publication, talk, or release surfaced directly from the site data.
          </p>
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
          <h2 class="w3-panel" id="recentWorkTitle">About Me</h2>
          <div class="w3-container" id="intro-container">
            <div id="intro">
              <p>
                I am a 3rd year PhD candidate in the
                <a href="https://knows.idlab.ugent.be/"><u>KNoWS group</u></a>
                of IDLab at Ghent University and the Digital Precision Biosystems
                group of
                <a href="https://vito.be/en/healthy-living-environment"
                  ><u>VITO NV</u></a
                >.
              </p>
              <p>
                I funded through the
                <a href="https://www.fwo.be/en/support-programmes/all-calls/phd/phd-fellowship-strategic-basic-research/">
                  <u>PhD fellowship - strategic basic research</u>
                </a>
                from the Research Foundation - Flanders (FWO).
              </p>
              <p>
                My PhD, PErsoNal Genome QUery IN health care and clinical practice
                (<i>PENGQUIN</i>), is investigating the integration of
                cutting-edge decentralized storage and semantic web technologies
                to innovate in the field of personal genomic data storage and
                usage. Specifically, I am interested in the topics of genomic data
                knowledge graph generation, data linking, ontology definition,
                data privacy policy enforcement, federated SPARQL querying, and
                scalable decentralized data storage approaches.
              </p>
              <p>
                More generally, I am passionate about building things that improve
                the world around me, especially in the realms of genomics and
                healthcare.
              </p>
              <div class="about-links-row">
                <router-link class="about-detail-btn btn-detail" :to="fellowshipDetailPath">
                  Fellowship Details
                </router-link>
              </div>
            </div>
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
import {
  publicationProfileLinks,
  researchPortalProfileUrl,
  type ExternalProfileLink,
} from "../data/publicationsData";
import { getFellowshipDetailPath } from "../data/fellowshipData";

interface ResearchTopicLink {
  label: string;
  destination: string;
  variant: "publication" | "talk";
  external?: boolean;
  href?: string;
  to?: {
    path: string;
    query?: Record<string, string>;
  };
}

export default defineComponent({
  name: "AboutMe",
  computed: {
    publicationProfileLinks(): ExternalProfileLink[] {
      return [
        ...publicationProfileLinks,
        {
          id: "research-portal",
          label: "Research Portal",
          url: researchPortalProfileUrl,
          iconUrl:
            "https://www.datocms-assets.com/53443/1747235092-monogram-vlaamse-overheid.svg?auto=format&fit=max&w=1200",
          variant: "research-portal",
        },
      ];
    },
    recentUpdates(): HomepageUpdate[] {
      return getRecentHomepageUpdates(1);
    },
    fellowshipDetailPath(): string {
      return getFellowshipDetailPath();
    },
    researchTopicLinks(): ResearchTopicLink[] {
      return [
        {
          label: "Clinical Genomics",
          destination: "Publications",
          variant: "publication",
          to: { path: "/publications", query: { tag: "topic", value: "Clinical Genomics" } },
        },
        {
          label: "Semantic Web",
          destination: "Publications",
          variant: "publication",
          to: { path: "/publications", query: { tag: "topic", value: "Semantic Web" } },
        },
        {
          label: "Semantic Querying",
          destination: "Talks",
          variant: "talk",
          to: { path: "/talks", query: { tag: "topic", value: "Semantic Querying" } },
        },
        {
          label: "Solid",
          destination: "Talks",
          variant: "talk",
          to: { path: "/talks", query: { tag: "topic", value: "Solid" } },
        },
        {
          label: "Data Privacy",
          destination: "Publications",
          variant: "publication",
          to: { path: "/publications", query: { tag: "topic", value: "Data Privacy" } },
        },
        {
          label: "Bioinformatics",
          destination: "Publications",
          variant: "publication",
          to: { path: "/publications", query: { tag: "topic", value: "Bioinformatics" } },
        },
        {
          label: "Knowledge Representation",
          destination: "Publications",
          variant: "publication",
          to: { path: "/publications", query: { tag: "topic", value: "Knowledge Representation" } },
        },
        {
          label: "Data Science",
          destination: "Talks",
          variant: "talk",
          to: { path: "/talks", query: { tag: "topic", value: "Data Science" } },
        },
      ];
    },
  },
});
</script>

<style>
#introduction {
  font-size: var(--font-size-subtitle);
  padding: 0 10px 128px;
}

#aboutMe {
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  padding: 18px 22px 22px;
}

#recentWork {
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  margin-bottom: 16px;
  padding: 18px 22px 22px;
}

#recentWorkHeader {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  margin: 0 0 2px;
  text-align: left;
}

.recentWorkTitleBlock {
  display: grid;
  gap: 3px;
  min-width: 0;
  justify-items: start;
  text-align: left;
}

.recentWorkEyebrow {
  color: rgba(var(--accent-ink-rgb), 0.92);
  font-size: var(--font-size-meta);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.1;
}

.recentWorkCount {
  border: 1px solid rgba(var(--accent-rgb), 0.34);
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--page-text);
  padding: 6px 12px;
  font-size: var(--font-size-meta);
  font-weight: 600;
  white-space: nowrap;
}

.recentWorkIntro {
  margin: 0 0 14px;
  max-width: 62ch;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-body);
  line-height: 1.45;
  text-align: left;
}

.recentWorkItem {
  position: relative;
  background: var(--surface-card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
  padding: 16px 18px 18px;
  margin-bottom: 0;
  overflow: hidden;
}

[data-theme="light"] .recentWorkItem {
  background: linear-gradient(180deg, rgba(var(--accent-secondary-rgb), 0.6), rgba(var(--accent-rgb), 0.18));
  border-color: rgba(16, 36, 59, 0.1);
  border-left-color: rgba(var(--accent-ink-rgb), 0.46);
  box-shadow: 0 12px 24px rgba(16, 36, 59, 0.08);
}

.recentWorkItem::after {
  content: "";
  position: absolute;
  top: -30%;
  right: -8%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.16), rgba(var(--accent-rgb), 0));
  pointer-events: none;
}

[data-theme="dark"] .recentWorkItem::after {
  display: none;
}

.recentWorkMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.recentWorkType,
.recentWorkDate {
  font-size: var(--font-size-meta);
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.04);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.recentWorkHeading {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: clamp(1.7rem, 2.4vw, 2.25rem);
  line-height: 1.14;
  letter-spacing: -0.02em;
  max-width: 34ch;
  position: relative;
  z-index: 1;
}

.recentWorkSummary {
  margin: 14px 0 0;
  max-width: 60ch;
  line-height: 1.58;
  font-size: var(--font-size-body-lg);
  position: relative;
  z-index: 1;
}

.recentWorkLink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  border: 1px solid rgba(var(--accent-rgb), 0.34);
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(var(--accent-rgb), 0.08);
  font-weight: 700;
  font-size: var(--font-size-body);
  position: relative;
  z-index: 1;
  transition: background-color 0.18s ease, transform 0.16s ease, border-color 0.18s ease;
}

.recentWorkLink::after {
  content: "→";
  font-size: 1em;
}

.recentWorkLink:hover {
  transform: translateY(-1px);
  background: rgba(var(--accent-rgb), 0.14);
  border-color: rgba(var(--accent-rgb), 0.46);
}

@media (max-width: 768px) {
  #recentWorkHeader {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .recentWorkItem {
    padding: 14px;
  }

  .recentWorkHeading {
    max-width: none;
  }

  .recentWorkSummary {
    max-width: none;
  }

  .recentWorkLink {
    width: 100%;
    justify-content: center;
  }
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
  border: 1px solid var(--surface-outline);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  padding-top: 0;
  font-size: var(--font-size-body-xl);
}

#genInfo .w3-container {
  padding: 22px 24px 24px;
}

#genInfo .home-contact-list {
  display: grid;
  gap: 10px;
  margin-bottom: 2px;
}

#genInfo .home-contact-row {
  margin: 0;
}

#genInfo .home-contact-link {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  column-gap: 20px;
  min-height: 48px;
  width: 100%;
}

#genInfo .home-contact-icon {
  justify-self: center;
  margin-right: 0 !important;
}

#genInfo i.w3-text-white {
  color: var(--page-text) !important;
}

#genInfo hr {
  margin: 22px 0;
  border: 0;
  border-top: 1px solid var(--surface-outline);
  opacity: 1;
}

#genInfo p {
  font-size: var(--font-size-body-xl);
  line-height: 1.45;
  margin: 0 0 12px;
}

#genInfo p.w3-large {
  font-size: var(--font-size-section-title) !important;
}

#about {
  background: transparent;
  color: var(--page-text);
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

#intro {
  font-size: var(--font-size-prose-l);
  font-family: var(--font-family-base);
  text-align: justify;
  background: transparent;
  color: var(--page-text);
  max-width: auto;
  line-height: 1.72;
}

#intro p {
  margin: 0;
}

#intro p:last-child {
  margin-bottom: 0;
}

.about-links-row {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.about-detail-btn {
  padding: 7px 14px;
}

#intro-container {
  margin-bottom: 0;
  padding: 12px 0 0;
}

#keywords {
  margin-left: 0;
}

.home-sidebar-section {
  display: grid;
  gap: 12px;
}

.home-profile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.home-profile-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  background: transparent;
  transition: transform 0.18s ease, background-color 0.18s ease;
}

.home-profile-link:hover {
  transform: translateY(-1px);
  background: var(--nav-hover-bg);
}

.home-profile-link-scholar {
  box-shadow: inset 0 0 0 1px rgba(var(--accent-rgb), 0.35);
}

.home-profile-link-semantic {
  box-shadow: inset 0 0 0 1px rgba(var(--accent-secondary-rgb), 0.35);
}

.home-profile-link-orcid {
  box-shadow: inset 0 0 0 1px rgba(166, 206, 57, 0.46);
}

.home-profile-link-research-portal {
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.34);
}

.home-profile-icon {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
  filter: grayscale(1) brightness(0) contrast(1.05);
}

[data-theme="dark"] .home-profile-icon {
  filter: grayscale(1) brightness(0) invert(1) contrast(1.05);
}

.home-sidebar-section-head {
  display: grid;
  gap: 6px;
}

.home-sidebar-section-title {
  margin: 0;
}

.home-sidebar-section-copy {
  margin: 0;
  color: var(--text-soft);
  font-size: var(--font-size-body);
  line-height: 1.45;
}

.home-topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
  position: relative;
  z-index: 1;
  isolation: isolate;
}

.home-topic-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  display: inline-flex;
  align-items: center;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 4px 11px;
  font-size: var(--font-size-body-sm);
  color: var(--page-text) !important;
  text-decoration: none;
  line-height: 1.2;
  position: relative;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.home-topic-tag-internal {
  border-radius: 999px;
}

.home-topic-tag-external {
  border-radius: 10px;
  border-color: var(--surface-outline);
  background: transparent;
}

.home-topic-tag-external:hover {
  border-color: rgba(196, 181, 253, 0.86);
  background: rgba(167, 139, 250, 0.16);
}

.home-topic-tag::after {
  content: attr(data-destination);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 4px);
  border: 1px solid var(--tag-tooltip-border);
  border-radius: 7px;
  padding: 3px 7px;
  background: var(--tag-tooltip-bg);
  color: var(--tag-tooltip-text);
  box-shadow: 0 8px 18px rgba(8, 15, 31, 0.24);
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 10;
}

.home-topic-tag:hover {
  transform: translateY(-1px);
  z-index: 1000;
}

.home-topic-tag:hover::after,
.home-topic-tag:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.home-topic-tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.35);
}

.home-topic-tag-publication {
  background: rgba(20, 184, 166, 0.16);
  border-color: rgba(20, 184, 166, 0.44);
  color: #06453f !important;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

.home-topic-tag-talk {
  background: rgba(20, 184, 166, 0.16);
  border-color: rgba(20, 184, 166, 0.44);
  color: #06453f !important;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

[data-theme="dark"] .home-topic-tag-publication {
  background: rgba(20, 184, 166, 0.26);
  border-color: rgba(20, 184, 166, 0.58);
  color: #d2fff4 !important;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(20, 184, 166, 0.98);
  --tag-tooltip-text: #021413;
}

[data-theme="dark"] .home-topic-tag-talk {
  background: rgba(20, 184, 166, 0.26);
  border-color: rgba(20, 184, 166, 0.58);
  color: #d2fff4 !important;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(20, 184, 166, 0.98);
  --tag-tooltip-text: #021413;
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

@media (max-width: 768px) {
  #introduction {
    padding: 0 8px 118px;
  }

  #genInfo .home-contact-link {
    grid-template-columns: 40px minmax(0, 1fr);
    column-gap: 16px;
    min-height: 44px;
  }

  #genInfo,
  #recentWork,
  #aboutMe {
    border-radius: 16px;
  }
}
</style>
