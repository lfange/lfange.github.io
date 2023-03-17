<script setup lang="ts">
import AutoLink from '@vuepress/theme-default/lib/client/components/AutoLink.vue'
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

const isArray = Array.isArray
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
const heroHeight = computed(() => frontmatter.value.heroHeight || 280)

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

const actions = computed(() => {
  if (!isArray(frontmatter.value.actions)) {
    return []
  }

  return frontmatter.value.actions.map(({ text, link, type = 'primary' }) => ({
    text,
    link,
    type,
  }))
})

const BackGroundDiv: FunctionalComponent = () => {
  console.log('bacKImg', backImgs, backImgs.value.length)
  if (!backImgs.value) return null
  let backIndex = localStorage.getItem('backIndex') || 0
  let index = +backIndex >= backImgs.value.length - 1 ? 0 : ++backIndex

  console.log('cbackImgs.value.length', index)
  const div = h('div', {
    style: {
      background: `url(${withBase(backImgs.value[index])}) center center / cover no-repeat`,
    },
    class: 'mask',
    // background: `url(${withBase(heroImage.value)})`,
    alt: heroAlt.value,
  })

  localStorage.setItem('backIndex', index)
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
    height: heroHeight.value,
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
  <header class="hero full-screen">
    <BackGroundDiv />
    <HomeHeroImage />

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
    <h1 v-if="heroText" id="main-title">
      {{ heroText }}
    </h1>

    <p v-if="tagline" class="description">
      {{ tagline }}
    </p>

    <p v-if="actions.length" class="actions">
      <AutoLink v-for="action in actions" :key="action.text" class="action-button" :class="[action.type]"
        :item="action" />
    </p>
  </header>
</template>
