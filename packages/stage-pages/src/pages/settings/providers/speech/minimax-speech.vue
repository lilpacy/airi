<script setup lang="ts">
import {
  SpeechPlayground,
  SpeechProviderSettings,
} from '@proj-airi/stage-ui/components'
import { useSpeechStore } from '@proj-airi/stage-ui/stores/modules/speech'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { generateSpeechMiniMax } from '@proj-airi/stage-ui/utils/minimax-tts'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

const providerId = 'minimax-speech'

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

const apiKeyConfigured = computed(() => !!providers.value[providerId]?.apiKey)

const availableVoices = computed(() => {
  return speechStore.availableVoices[providerId] || []
})

async function handleGenerateSpeech(input: string, voiceId: string, _useSSML: boolean): Promise<ArrayBuffer> {
  const providerConfig = providersStore.getProviderConfig(providerId)
  return await generateSpeechMiniMax({
    text: input,
    voiceId,
    apiKey: providerConfig?.apiKey as string | undefined,
    groupId: providerConfig?.groupId as string | undefined,
  })
}

watch(providers, async () => {
  await speechStore.loadVoicesForProvider(providerId)
}, { immediate: true })
</script>

<template>
  <SpeechProviderSettings
    :provider-id="providerId"
  >
    <template #playground>
      <SpeechPlayground
        :available-voices="availableVoices"
        :generate-speech="handleGenerateSpeech"
        :api-key-configured="apiKeyConfigured"
        default-text="Hello! This is a test of the MiniMax voice synthesis."
      />
    </template>
  </SpeechProviderSettings>
</template>

<route lang="yaml">
  meta:
    layout: settings
    stageTransition:
      name: slide
  </route>
