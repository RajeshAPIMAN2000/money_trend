import HeroBanner from '../components/common/HeroBanner.jsx'
import MarketTicker from '../components/common/MarketTicker.jsx'
import HomeMiddleSections from '../components/home/HomeMiddleSections.jsx'
import Aurora from '../components/react-bits/Aurora.jsx'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Aurora
        colorStops={['#0056D2', '#F59E0B', '#E0F2FE']}
        amplitude={0.65}
        blend={0.55}
        speed={0.85}
      />
      <div className="relative z-10">
        <HeroBanner />
        <MarketTicker />
        <HomeMiddleSections />
      </div>
    </div>
  )
}
