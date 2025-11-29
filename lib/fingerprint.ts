let fpPromise: Promise<any> | null = null

export async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return Promise.resolve('server-side-' + Date.now())
  }
  
  try {
    if (!fpPromise) {
      const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
      fpPromise = FingerprintJS.load()
    }

    const fp = await fpPromise
    const result = await fp.get()

    return result.visitorId
  } catch (error) {
    console.error('Error getting fingerprint:', error)
    return 'error-' + Date.now()
  }
}
