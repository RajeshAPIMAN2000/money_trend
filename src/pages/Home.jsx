import { lazy, Suspense, useEffect, useState } from 'react'
import HeroBanner from '../components/common/HeroBanner.jsx'
import MarketTicker from '../components/common/MarketTicker.jsx'
import { useHomeData } from '../hooks/useHomeData.js'

const Aurora = lazy(() => import('../components/react-bits/Aurora.jsx'))
const HomeMiddleSections = lazy(() => import('../components/home/HomeMiddleSections.jsx'))

export default function Home() {
  const homeData = useHomeData()
  const [showAurora, setShowAurora] = useState(false)

  useEffect(() => {
    const startAurora = () => {
      setShowAurora(true)
      window.removeEventListener('scroll', startAurora)
      window.removeEventListener('pointerdown', startAurora)
      window.removeEventListener('keydown', startAurora)
    }

    window.addEventListener('scroll', startAurora, { passive: true })
    window.addEventListener('pointerdown', startAurora, { passive: true })
    window.addEventListener('keydown', startAurora)

    return () => {
      window.removeEventListener('scroll', startAurora)
      window.removeEventListener('pointerdown', startAurora)
      window.removeEventListener('keydown', startAurora)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {showAurora && (
        <Suspense fallback={null}>
          <Aurora
            colorStops={['#0056D2', '#F59E0B', '#E0F2FE']}
            amplitude={0.65}
            blend={0.55}
            speed={0.85}
          />
        </Suspense>
      )}
      <div className="relative z-10">
        <HeroBanner />
        <MarketTicker items={homeData.tickerItems} loading={homeData.loading} />
        <Suspense fallback={<div className="min-h-[420px] bg-white/75" aria-hidden />}>
          <HomeMiddleSections {...homeData} />
        </Suspense>
      </div>
    </div>
  )
}
