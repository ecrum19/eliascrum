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
              <a href="https://research.ugent.be/web/person/elias-david-crum-0/en">
                <i class="fa fa-briefcase fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"></i
              >Ph.D. Candidate</a>
            </p>
            <p>
              <a href="https://www.google.com/maps/place/Ghent">
                <i class="fa fa-map-marker fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"></i
              >Ghent, BE</a>
            </p>
            <p>
              <a href="mailto:elias.crum@ugent.be">
                <i class="fa fa-envelope fa-fw w3-margin-right w3-xlarge w3-text-white w3-hover-opacity"></i
              >elias.crum@ugent.be</a>
            </p>
            <hr />

            <p class="w3-large">
              <b
                ><i
                  class="fa fa-asterisk fa-fw w3-margin-right w3-text-teal"
                ></i
                >Skills</b
              >
            </p>
            <p>Adobe Photoshop</p>
            <div class="w3-light-grey w3-round-xlarge w3-small">
              <div
                class="w3-container w3-center w3-round-xlarge w3-teal"
                style="width: 90%"
              >
                90%
              </div>
            </div>
            <p>Illustrator</p>
            <div class="w3-light-grey w3-round-xlarge w3-small">
              <div
                class="w3-container w3-center w3-round-xlarge w3-teal"
                style="width: 75%"
              >
                75%
              </div>
            </div>
            <p>Media</p>
            <div class="w3-light-grey w3-round-xlarge w3-small">
              <div
                class="w3-container w3-center w3-round-xlarge w3-teal"
                style="width: 50%"
              >
                50%
              </div>
            </div>
            <br />

            <p class="w3-large w3-text-theme">
              <b
                ><i class="fa fa-globe fa-fw w3-margin-right w3-text-teal"></i
                >Languages</b
              >
            </p>
            <p>English</p>
            <div class="w3-light-grey w3-round-xlarge">
              <div
                class="w3-round-xlarge w3-teal"
                style="height: 24px; width: 100%"
              ></div>
            </div>
            <p>Spanish</p>
            <div class="w3-light-grey w3-round-xlarge">
              <div
                class="w3-round-xlarge w3-teal"
                style="height: 24px; width: 55%"
              ></div>
            </div>
            <p>German</p>
            <div class="w3-light-grey w3-round-xlarge">
              <div
                class="w3-round-xlarge w3-teal"
                style="height: 24px; width: 25%"
              ></div>
            </div>
            <br />
          </div>
        </div>
        <br />

        <!-- End Left Column -->
      </div>

      <!-- Right Column -->
      <div class="w3-twothird">
        <div id="aboutMe" class="w3-container w3-card w3-black w3-margin-bottom">
          <h1 class="w3-padding-16" id="about">About Me</h1>
          <div class="w3-container">
            <body id="intro">
              I am a PhD candidate co-promoted by the KNoWS group within IDLab
              at Ghent University and the Digital Precision Health group of VITO
              NV.
              <br />
              <br />
              My PhD, PErsoNal Genome QUery IN health care and clinical practice
              (<i>PENGQUIN</i>), is investigating the integrating cutting-edge
              decentralized storage and semantic web technologies to innovate in
              the field of personal genomic data storage and usage.
              Specifically, I interested in the topics of knowledge graph
              generation, data linking, ontology definition, data privacy
              enforcement, federated SPARQL querying, and decentralized data
              storage approaches.
              <br />
              <br />
              I am passionate about building things that improve the world
              around me, especially in the realms of genomics and healthcare.
            </body>
            <hr />
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
}


#aboutMe {
  background: rgba(0, 0, 0, 0.8);
  outline: 2px solid rgba(255, 255, 255, 0.8);
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
}

#intro {
  font-size: 22pt;
  font-family: "KoHo", sans-serif;
  background: rgba(0, 0, 0, 0);
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
