<template>
  <div class="stuff">
    <div class="entry">
      <h1>About Me</h1>
      <br />
      <body id="intro">
        I am a PhD candidate co-promoted by the KNoWS group within IDLab at
        Ghent University and the Digital Precision Health group of VITO NV.
        <br />
        <br />
        My PhD, PErsoNal Genome QUery IN health care and clinical practice
        (<i>PENGQUIN</i>), is investigating the integrating cutting-edge
        decentralized storage and semantic web technologies to innovate in the
        field of personal genomic data storage and usage. Specifically, I
        interested in the topics of knowledge graph generation, data linking,
        ontology definition, data privacy enforcement, federated SPARQL
        querying, and decentralized data storage approaches.
        <br />
        <br />
        I am passionate about building things that improve the world around me,
        especially in the realms of genomics and healthcare.
      </body>
    </div>

    <body></body>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  methods: {},
};
</script>

<style>
div.stuff {
  position: relative;
  top: 20px;
  left: 50px;
  opacity: 0.7;
  outline: 2px solid white;
  width: 50%;
  padding: 2%;
}

.entry {
  color: white;
}

#intro {
  font-size: 14pt;
}
</style>
