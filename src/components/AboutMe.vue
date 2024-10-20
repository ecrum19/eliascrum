<template>
  <div
    id="introduction"
    class="w3-content w3-margin-top"
    style="max-width: 1400px"
  >
    <div id="entry" class="w3-row-padding">
      <!-- Left Column -->
      <div class="w3-third">
        <div id="genInfo" class="w3-text-white w3-card-4">
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
                  class="fa fa-graduation-cap fa-fw w3-xlarge w3-margin-right w3-text-blue"
                ></i
                >Research Topics</b
              >
            </p>
            <ul id="keywords">
              <li><a href="https://solidproject.org/">Solid</a></li>
              <li>
                <a href="https://comunica.dev/">Decentralized Querying</a>
              </li>
              <li>Data Privacy Policies</li>
              <li>Linked Data</li>
              <li>Knowledge Graph Generation</li>
              <li>Ontology Generation</li>
              <li>Clinical Genomics</li>
            </ul>

            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i
                  class="fa fa-address-card fa-fw w3-xlarge w3-margin-right w3-text-red"
                ></i>
                <a
                  href="https://scholar.google.com/citations?user=fAJsN2kAAAAJ&hl=en"
                  >Curriculum Vitae</a
                ></b
              >
            </p>

            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i
                  class="fa fa-newspaper-o fa-fw w3-xlarge w3-margin-right w3-text-yellow"
                ></i>
                <a
                  href="https://scholar.google.com/citations?user=fAJsN2kAAAAJ&hl=en"
                  >Publications</a
                ></b
              >
            </p>

            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i
                  class="fa fa-bullhorn fa-fw w3-xlarge w3-margin-right w3-text-orange"
                ></i>
                <a
                  href="https://scholar.google.com/citations?user=fAJsN2kAAAAJ&hl=en"
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
        <div
          id="aboutMe"
          class="w3-container w3-card w3-black"
        >
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

<script>
export default {
  data: () => ({}),
  methods: {},
};
</script>

<style>
#introduction {
  top: 160px;
  position: relative;
  font-size: 16pt;
}

#aboutMe {
  background: rgba(0, 0, 0, 0.8);
  outline: 2px solid rgba(255, 255, 255, 0.8);
  align-items: center;
}

#entry {
  color: white;
  background: rgba(0, 0, 0, 0);
}

a {
  text-decoration: none;
}

#genInfo {
  background: rgba(0, 0, 0, 0.8);
  outline: 2px solid rgba(255, 255, 255, 0.8);
  padding-top: 5%;
}
#genInfo p {
  font-size: 16pt;
}

#about {
  background: rgba(0, 0, 0, 0);
  margin-top: 10px;
}

#intro {
  font-size: 22pt;
  font-family: "KoHo", sans-serif;
  background: rgba(0, 0, 0, 0);
}

#intro-container {
  margin-bottom: 10px;
}

#keywords {
  font-size: 15pt;
  margin-left: 30px;
}

div.school {
  background: rgba(0, 0, 0, 0.8);
  position: flex;
  top: 0px;
  left: 550px;
  opacity: 0.8;
  outline: 2px solid rgba(255, 255, 255, 0.8);
  width: 40%;
  padding: 2%;
}
</style>
