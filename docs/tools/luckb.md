# luckb

<a-row>
    <a-col :span="12">col-12</a-col>
    <a-col :span="12">col-12</a-col>
  </a-row>
<a-button type="primary" @click="getPrize()">Start</a-button>

<div class="ball-container">
  <span :class="index < 6 ? 'ball' : 'lastball' " v-for="(ball,index) in luckArr">{{ ball }}</span>
</div>

<script setup lang="ts">
  import { ref, reactive, watch, computed, provide } from "vue";

  const luckArr = ref<string[]>(['05', '12', '32', '19', '26', '21'])

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
    while (set.size < 7) {
      set.add(Math.round(Math.random() * 16))
    }
    luckArr.value = [...set] 
  }

</script>
<style scoped>

    .ball-container {
      width: 250px;
      margin: 0 auto;
      background-color: yellow;
      padding: 6px 4px;
    }

    .ball-container>span {
      display: inline-block;
      font-weight: bold;
      margin: 2px;

      width: 2em;
      text-align: center;
      line-height: 2em;
      border-radius: 50%;
      font-size: 14px;
      color: white;
    }

    .ball {
      background: linear-gradient(270deg, #c50701, #e62c60);
    }

    .lastball {
      background: blue;
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
