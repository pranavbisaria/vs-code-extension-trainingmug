<script lang="ts">
    let todos = [];
    let count  = 0;
</script>

<style>
    div {
        color: brown;
    }
</style>

<div>Hello world, I am Pranav Bisaria</div>
<div>{count}</div>
<button on:click={() => {
    count++;
}}
>
increment</button>
