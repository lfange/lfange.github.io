

<script setup lang="ts">
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import {
  ClientOnly,
  usePageFrontmatter,
  useSiteLocaleData,
  withBase,
} from '@vuepress/client'

import type { FunctionalComponent } from 'vue'
import { computed, h } from 'vue'
import type { DefaultThemeHomePageFrontmatter } from '@vuepress/theme-default/lib/shared/index.js'
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables/index.js'

const frontmatter = usePageFrontmatter<DefaultThemeHomePageFrontmatter>()
const siteLocale = useSiteLocaleData()
const isDarkMode = useDarkMode()

const backImgs = computed(() => {
  if (frontmatter.value.bacKImg !== undefined) {
    return frontmatter.value.bacKImg
  }
})

const heroImage = computed(() => {
  if (isDarkMode.value && frontmatter.value.heroImageDark !== undefined) {
    return frontmatter.value.heroImageDark
  }
  return frontmatter.value.heroImage
})
const heroAlt = computed(
  () => frontmatter.value.heroAlt || heroText.value || 'hero'
)

const heroText = computed(() => {
  if (frontmatter.value.heroText === null) {
    return null
  }
  return frontmatter.value.heroText || siteLocale.value.title || 'Hello'
})

const tagline = computed(() => {
  if (frontmatter.value.tagline === null) {
    return null
  }
  return (
    frontmatter.value.tagline ||
    siteLocale.value.description ||
    'Welcome to your VuePress site'
  )
})


const BackGroundDiv: FunctionalComponent = () => {
  if (!backImgs.value) return null
  let backIndex: number | string
  if (typeof window !== 'undefined') {
    backIndex = window.localStorage.getItem('backIndex') || 0
  } else {
    backIndex = Math.floor(Math.random() * backImgs.value.length)
  }

  let index = +backIndex >= backImgs.value.length - 1 ? 0 : ++backIndex

  console.log('cbackImgs.value.length', index)
  const div = h('div', {
    style: {
      background: `url(${withBase(backImgs.value[index])}) center center / cover no-repeat`,
      // opacity: isDarkMode.value ? 0.3 : 'inherit'
      filter: isDarkMode.value ? 'brightness(0.5)' : 'inherit'
    },
    class: 'mask',
    // background: `url(${withBase(heroImage.value)})`,
    alt: backImgs.value[index],
  })

  if (typeof window !== 'undefined') window.localStorage.setItem('backIndex', index)
  if (frontmatter.value.heroImageDark === undefined) return div

  // wrap hero image with <ClientOnly> to avoid ssr-mismatch
  // when using a different hero image in dark mode
  return h(ClientOnly, () => div)
}

const HomeHeroImage: FunctionalComponent = () => {
  console.log('frontmatter', frontmatter)
  if (!heroImage.value) return null
  const img = h('img', {
    src: withBase(heroImage.value),
    alt: heroAlt.value,
  })
  if (frontmatter.value.heroImageDark === undefined) {
    return img
  }
  // wrap hero image with <ClientOnly> to avoid ssr-mismatch
  // when using a different hero image in dark mode
  return h(ClientOnly, () => img)
}

const tobuttom = (e) => {
  console.log('tobuttom', e)
  window.scrollTo({
    top: e.clientY,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="home-main" v-if="frontmatter.layout">
    <div class="full-screen">
      <BackGroundDiv />
      <HomeHeroImage />

      <h1 v-if="heroText" id="main-title">
        {{ heroText }}
      </h1>
      <p v-if="tagline" class="description">
        {{ tagline }}
      </p>
      <button class="slide-down-button" @click="tobuttom"><svg xmlns="http://www.w3.org/2000/svg"
          class="icon slide-down-icon" viewBox="0 0 1024 1024" fill="currentColor" aria-label="slide-down icon">
          <path
            d="M108.775 312.23c13.553 0 27.106 3.734 39.153 11.806l375.205 250.338 363.641-252.808c32.587-21.624 76.499-12.83 98.123 19.757 21.685 32.467 12.95 76.56-19.576 98.184l-402.854 278.89c-23.733 15.901-54.694 15.962-78.547.12L69.501 442.097c-32.647-21.685-41.441-65.777-19.817-98.304 13.734-20.54 36.201-31.563 59.09-31.563Z">
          </path>
        </svg><svg xmlns="http://www.w3.org/2000/svg" class="icon slide-down-icon" viewBox="0 0 1024 1024"
          fill="currentColor" aria-label="slide-down icon">
          <path
            d="M108.775 312.23c13.553 0 27.106 3.734 39.153 11.806l375.205 250.338 363.641-252.808c32.587-21.624 76.499-12.83 98.123 19.757 21.685 32.467 12.95 76.56-19.576 98.184l-402.854 278.89c-23.733 15.901-54.694 15.962-78.547.12L69.501 442.097c-32.647-21.685-41.441-65.777-19.817-98.304 13.734-20.54 36.201-31.563 59.09-31.563Z">
          </path>
        </svg>
      </button>
    </div>
    <svg width="0" height="0">
      <filter id="wave">
        <!--baseFrequency设置0.01 0.09两个值，代表x轴和y轴的噪声频率-->
        <feTurbulence baseFrequency="0.01 0.03">
          <!--这是svg动画的定义方式，通过动画不断改变baseFrequency的值，从而形成波动效果-->
          <animate attributeName="baseFrequency" dur="50s" keyTimes="0;0.5;1" values="0.01 0.09;0.02 0.13;0.01 0.09"
            repeatCount="indefinite"></animate>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="10" />
      </filter>
    </svg>

    <svg width="0" height="0">
      <filter id="text">
        <!--定义feTurbulence滤镜-->
        <feTurbulence baseFrequency="0.02" seed="0">
          <!--这是svg动画的定义方式，通过动画不断改变seed的值，形成抖动效果-->
          <animate attributeName="seed" dur="1s" keyTimes="0;0.5;1" values="1;2;3" repeatCount="indefinite"></animate>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="10" />
      </filter>
    </svg>
  </div>

  <ParentLayout>
    少时诵诗书ss
  </ParentLayout>
</template>

