# luckb

<a-button type="primary" @click="getPrize()">Start</a-button>

<a-tabs v-model:activeKey="active" @change="change">
  <a-tab-pane key="dobule" tab="dobule ball"></a-tab-pane>
  <a-tab-pane key="lucky" tab="lucky ball" force-render></a-tab-pane>
</a-tabs>

<div class="ball-container">
  <div v-for="(ar, arindx) in luckArr">
    <span :class="index + 1 <= len ? 'ball' : 'lastball' " v-for="(ball,index) in ar"> {{ ball }}</span>
    <a-button type="text" danger><delete-outlined /></a-button>
    <delete-outlined />
  </div>
</div>

<script setup lang="ts">
  import { ref, reactive, watch, computed, provide } from "vue";

  const luckArr = ref<[][[]]>([[]])
  const active = ref<string>('dobule')

  const isdoblue = computed<Boolean>(() => active.value === 'dobule')

  const len = computed<number>(() => isdoblue.value ? 6 : 5)

  function getBallLen() {
    const redMax = isdoblue.value ? 33 : 35
    const bluMax = isdoblue.value ? 16 : 12
    return { redMax, bluMax }
  }

  function getBalls() {
    const { redMax, bluMax } = getBallLen()
    const redArr = new Array(redMax).fill('1').map((i, ind) => ind + 1)
    const blueArr = new Array(bluMax).fill('1').map((i, ind) => ind + 1)
    return { redArr, blueArr }
  }

  function getPrize() {

    const { redMax, bluMax } = getBallLen()
    const { redArr, blueArr } =  getBalls()

    const redBall = new Set()
    const blueBall = new Set()

    for (let i = redMax, le = redMax - len.value; i > le; i-- ) {
      const radom = Math.random() * i
      const index: number = radom === 0 ? 0 : Math.floor(radom)
      redBall.add(redArr[index])
      redArr.splice(index, 1)
    }

    const redB = [...redBall].sort((a, b) => a - b).map((i: number) => i < 10 ? `0${i}` : i )

    for (let i = bluMax, le = bluMax - 7 + len.value; i > le; i--) {
      const radom = Math.random() * i
      const index: number = radom === 0 ? 0 : Math.floor(radom)
      blueBall.add(blueArr[index])
      blueArr.splice(index, 1)
    }

    const blueB = [...blueBall].sort((a, b) => a - b).map((i: number) => i < 10 ? `0${i}` : i )

    luckArr.value.push([...redB, ...blueB])

    localStorage.setItem(active.value, JSON.stringify(luckArr.value))
  }

  function change(tab) {
    luckArr.value = JSON.parse(localStorage.getItem(tab)) || []
    console.log('change', luckArr.value);
  }

</script>
<style scoped>
  .ball-container {
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
    user-select: none;
  }

  .ball {
    background: linear-gradient(270deg, #c50701, #e62c60);
  }
  .lastball {
    background: blue;
  }

</style>
