<script lang="ts">
</script>

<button on:click={() => {
  console.log("Executing the script");
  tsvscode.postMessage({
    type: 'onInfo',
    value: 'Executing Code Submission'
  });

  setTimeout(() =>{
    try {
      tsvscode.postMessage({
        type: 'executeGitCommit',
        value: "cd .. && git add . && git commit -m 'Code Submission' && git push --force origin main && cd trainingmug"
      });
    } catch (error) {
        console.log(error);
        tsvscode.postMessage({
          type: 'onError',
          value: 'Code is submission failed'
        });
    }
	},500)
  
  setTimeout(() =>{
    tsvscode.postMessage({
      type: 'onInfo',
      value: 'Code is submitted for review'
    });
	},3000);
  console.log("Script is Executed");
  }} class="submit-button">Submit</button>

<button on:click={() => {
  try {
    tsvscode.postMessage({
      type: 'run',
      value: ''
    });
  } catch (error) {
    console.log(error);
    tsvscode.postMessage({
      type: 'onError',
      value: error
    });
  }
}} class="test-button">Test</button>

<button on:click={() => {
  try {
    tsvscode.postMessage({
      type: 'stop',
      value: ''
    });
  } catch (error) {
    console.log(error);
    tsvscode.postMessage({
      type: 'onError',
      value: error
    });
  }
}} class="stop-button">Stop</button>