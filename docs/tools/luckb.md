# luckb

<a-button type="primary" @click="getPrize()">Start</a-button>
 <a-tabs v-model:activeKey="isdoblue">
  <a-tab-pane key="dobule" tab="dobule ball"></a-tab-pane>
  <a-tab-pane key="lucky" tab="lucky ball" force-render></a-tab-pane>
</a-tabs>
  len {{ len }}
<div class="ball-container">
  <p v-for="ar in luckArr">
    <span :class="index < len ? 'ball' : 'lastball' " v-for="(ball,index) in ar">{{ ball }}</span>
  </p>
</div>

<script setup lang="ts">
  import { ref, reactive, watch, computed, provide } from "vue";

  const luckArr = ref<[][[]]>([['05', '12', '32', '19', '26', '21']])
  const isdoblue = ref<string>('dobule')

  const len = computed<number>(() => isdoblue.value === 'dobule' ? 6 : 5)

  console.log("Boolean", len.value)

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
    luckArr.value.push([...set])
  }

</script>
<style scoped>
  .ball-container {
    width: 250px;
    background-color: yellow;
    padding: 6px 4px;
  }

  .ball-container span {
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

</style>
