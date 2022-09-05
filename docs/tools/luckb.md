# luckb

<a-button type="primary" @click="getPrize()">Start</a-button>
{{isdoblue}}
<a-tabs v-model:activeKey="active">
  <a-tab-pane key="dobule" tab="dobule ball"></a-tab-pane>
  <a-tab-pane key="lucky" tab="lucky ball" force-render></a-tab-pane>
</a-tabs>
<div class="ball-container">
  <p v-for="(ar, arindx) in luckArr">
    <span :class="index < len ? 'ball' : 'lastball' " v-for="(ball,index) in ar">{{ ball }}</span>
    <a-button type="text" danger>删除</a-button>
  </p>
</div>

<script setup lang="ts">
  import { ref, reactive, watch, computed, provide } from "vue";

  const luckArr = ref<[][[]]>([['05', '12', '32', '19', '26', '21']])
  const active = ref<string>('dobule')

  const isdoblue = computed<Boolean>(() => active.value === 'dobule')

  const len = computed<number>(() => isdoblue.value ? 7 : 6)

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

    const { redArr, blueArr } =  getBalls()
    console.log('this', redArr, blueArr, len.value);

    const redBall = new Set()
    const blueBall = new Set()

    // while(redBall.size < len.value) {
      var prizeNum: number = Math.floor(Math.random() * 33)
      console.log('prizeNum', prizeNum);
      const index = redArr.findIndex((i) => i === prizeNum)
      console.log('index', index);
      // const ball = redArr.splice
      // if (prizeNum > 0) redBall.add(prizeNum)
    // }
    console.log('[...set].sort()', [...redBall].sort());
    // while (blueBall.size < 7 - len.value) {
    //   blueBall.add(Math.round(Math.random() * 16))
    // }
    // luckArr.value.push([...redBall, ...blueBall])
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
