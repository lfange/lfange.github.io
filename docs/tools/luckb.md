# luckb

<div class='start prizeBtn' id="dobble" @click="getPrize()">Start</div>

{{ state.luck }}
{{ msg }}

<a-button type="primary">Primary Button</a-button>

<div id="ball-container">
  <span :class="index < 6 ? 'prizNum' : 'lastprizNum' " v-for="(ball,index) in luckArr">{{ ball }}</span>
</div>

<script setup lang="ts">
  import { ref, reactive, watch, computed, provide } from "vue";

  const msg = 'msg'

  const luckArr = ref<string[]>([])

  const state = reactive({
    luck: 'reactive'
  })

  function getPrize() {
    const set = new Set()

    while(set.size < 6) {
      var prizeNum: number = Math.round(Math.random() * 33)
      if (prizeNum > 0) set.add(prizeNum)
    }
    console.log('ball', set)

    set.add(Math.round(Math.random() * 16))
    luckArr.value = [...set] 
    // prizeTicket += '<span class="lastprizNum">' + Math.round(Math.random() * 16) + '</span><br/>'
    // document.getElementById("getPrize").innerHTML += '\n\n' + prizeTicket
  }

</script>
<style scoped>
	html,
    body,
    #map {
      height: 100%;
      margin: 0;
      padding: 0;
    }

    .prizeBtn {
      color: white;
      font-size: 16px;
      margin: 20vh auto;
      padding: 0 6px;
      height: 40px;
      line-height: 40px;
      background-color: #409EFF;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      display: inline-block;
    }

    #ball-container {
      width: 230px;
      margin: 0 auto;
      background-color: yellowgreen;
      padding: 6px 4px;
    }

    #ball-container>span {
      display: inline-block;
      font-weight: bold;
      margin: 2px 0;
    }

    .prizNum {
      width: 25px;
      text-align: center;
      line-height: 25px;
      background: red;
      border-radius: 50%;
      padding: 2px;
      font-size: 14px;
      color: white;
    }

    .lastprizNum {
      width: 25px;
      text-align: center;
      line-height: 25px;
      background: blue;
      border-radius: 50%;
      padding: 2px;
      font-size: 14px;
      color: white;
    }

    .container {
      background-color: red;
      overflow: hidden;
      /* creates a block formatting context */
      margin: 0px 20vw 1vh;
      box-sizing: border-box;
    }

    p {
      background-color: lightgreen;
      margin: 10px 0;
    }
	#div1 {
		width: 600px;
		height: 300px;
		background: #409EFF;
		text-align: center;
		margin: 0 auto;
		overflow-y: scroll;
	}
	#div1::-webkit-scrollbar {
		width:2px;
	}
	#div1::-webkit-scrollbar-track{
		background: #999;
		border-radius:2px;
		cursor: pointer;
	}
	#div1::-webkit-scrollbar-thumb {
		background: red;
		height: 1px;
    border-radius: 16px;
	}
	#div1::-webkit-scrollbar-corner{
	    background: yellow;
	}
	#div2 {
		width: 200px;
		height: 150px;
		margin: 50px auto 0;
		background: #9ACD32;
	}
	#div3 {
		width: 60px;
		height: 30px;
		background: yellow;
		margin: 0 auto;
	}

</style>