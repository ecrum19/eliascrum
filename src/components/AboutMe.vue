<template>
  <div class="stuff">
    <v-container>
      <v-col cols="12">
        <v-card
          variant="tonal"
          justify="center"
          max-width="550"
          class="mx-auto"
          color="indigo-darken-3"
        >
        <div class="entry">
            <h1>Welcome to the TRIPLE App!</h1>
            <h2>Below is a guide to get you started.</h2>
            <h3>(Similar instructions found in the README)</h3>
          </div>
        </v-card>
      </v-col>
    </v-container>

    <body>
      <div class="container">
        <h1 class="guide">Getting Started:</h1>
        <hr />

        <h2 class="req">Requirements:</h2>
        <ul>
          <li>
            <a href="https://nodejs.org/en/">Node.js</a>
          </li>
          <li><a href="https://www.npmjs.com/package/download">npm</a></li>
          <li><a href="https://git-scm.com/downloads">git</a></li>
        </ul>
        <hr />

        <h2 class="req">1. Repo Cloning and Starting your local Solid pod</h2>
        <ol>
          <li>
            Clone the project git repo (it has some useful scripts for later).<br />For
            help see
            <a
              href="https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository"
              >git clone guide.</a
            >
          </li>
        </ol>
        <pre><code>$ git clone https://github.com/ecrum19/TRIPLE_App.git</code></pre>
        <ol start="2">
          <li>
            To start pod set-up, within the TRIPLE_App/ directory execute the
            following command:
          </li>
        </ol>
        <pre><code>$ bash makePod.sh</code></pre>

        <hr />

        <h2 class="req">2. Setting up the Solid pod</h2>
        <ol>
          <li>
            Using a web browser navigate to
            <a href="http://localhost:3000/">http://localhost:3000/</a>
          </li>
          <li>Click the link: <b>"Sign up for an account"</b></li>
          <li>Fill out the fields and click <b>"Register"</b></li>
          <li>On the <b>"Your Account"</b> page, click on <b>"Create pod"</b></li>
          <li>Enter a name for the pod and click <b>"Create pod"</b></li>
          <li>Return to the home page by clicking <b>"Back"</b></li>
        </ol>
        <p>
          <b>Voila</b>, you now have a pod hosted by your local machine!<br />
          <span class="detail">
            (Please note that if the terminal window you executed the bash script above is terminated, 
            the Solid pod will no longer be accessible until it is re-launched. For more info
            see
            <a
              href="https://communitysolidserver.github.io/CommunitySolidServer/latest/"
              >Community Solid Server Documentation</a
            >.)
          </span>
        </p>

        <hr />

        <h2 class="req">3. Register your Pod on your new WebID</h2>
        <ol>
          <li>Within the TRIPLE_App/ directory, execute the command below:</li>
          <pre><code>$ bash podRegistration.sh</code></pre>
          <li>At the prompt, enter the name of your pod from above (E.g. test)</li>
        </ol>

        <hr />

        <h2 class="req">4. Solid Pod Login within the TRIPLE App</h2>
        <ol>
          <li>
            Click the <b>"Data Upload"</b> tab in the nav bar within the TRIPLE
            App
          </li>
          <li>
            If you followed the above sections to launch a local Solid Pod, simply
            click the <b>"Login"</b> button that appears (because your pod provider is localhost:3000)
          </li>
          <li>After the redirect, click the <b>"Authorize"</b> button</li>
          <li>
            Once redirected back to the main page of the TRIPLE App, use the nav
            bar to select the <b>"Data Upload"</b> tab
          </li>
        </ol>

        <hr />

        <h2 class="req">5. Data Upload Functionality</h2>
        <ol>
          <li>Click the <b>"Data Upload"</b> tab of the nav bar above</li>
        </ol>
      </div>
    </body>
  </div>
</template>


<script>
export default {
  data: () => ({}),
  methods: {},
};
</script>


<style>
.stuff {
  position: relative;
  
}

</style>