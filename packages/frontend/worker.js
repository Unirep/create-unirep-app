import {
  getAssetFromKV,
  serveSinglePageApp,
} from '@cloudflare/kv-asset-handler'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    // Add logic to decide whether to serve an asset or run your original Worker code
    return getAssetFromKV(event, { mapRequestToAsset: serveSinglePageApp })
  } catch (e) {
    const pathname = new URL(event.request.url).pathname
    return new Response(`"${pathname}" not found`, {
      status: 404,
      statusText: 'not found',
    })
  }
}
