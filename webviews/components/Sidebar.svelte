<script lang="ts">
  import { onMount } from "svelte";
  import { outputStore } from './store';

  let statuses: Array<{head: string, body: any}> = [];

  // onMount(()=> {
  //   window.addEventListener('message', event =>{
  //     const message = event.data;
  //     console.log("from svelte:  "+message);
  //     switch (message.type){
  //       case 'update-sidebar':
  //       for (const [key, value] of Object.entries(message.value)) {
  //         statuses = [{head: key, body: value}, ...statuses];
  //       }
  //         break;
  //     }
  //   })
  // })

  onMount(()=> { 
    window.addEventListener('message', event =>{ 
      const message = event.data; console.log("from svelte: "+message); 
      switch (message.type){ 
        case 'update-sidebar': 
        outputStore.update(current => { 
          const newValues = []; 
          for (const [key, value] of Object.entries(message.value)) { 
            newValues.push({head: key, body: value}); 
          } 
          return [...newValues, ...current]; 
        }); 
        break; 
      } 
    }) 
  });

  outputStore.subscribe((value) => {
		statuses = value;
	});
</script>

<button on:click={() => {
    tsvscode.postMessage({
      type: 'executeGitCommit',
      value: ""
    });
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
<hr>

<div id="tableContainer">
  <table>
    <tr>
      <th>Head</th>
      <th>Value</th>
    </tr>

  {#each statuses as status}
    <tr>
      <td>{status.head}</td>
      <td>{status.body}</td>
    </tr>
    {/each}
  </table>
</div>