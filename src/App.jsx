import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import Home from './pages/Home.jsx'
import FDMarketplace from './pages/FDMarketplace.jsx'
import MutualFunds from './pages/MutualFunds.jsx'
import Dashboard from './pages/Dashboard.jsx'
import News from './pages/News.jsx'
import Goals from './pages/Goals.jsx'
import Calculators from './pages/Calculators.jsx'
import Support from './pages/Support.jsx'
import KYC from './pages/KYC.jsx'
import Profile from './pages/Profile.jsx'
import Blog from './pages/Blog.jsx'
import BlogArticle from './pages/BlogArticle.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import Products from './pages/Products.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/fd-rd" element={<FDMarketplace />} />
          <Route path="/mutual-funds" element={<MutualFunds />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/support" element={<Support />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/article" element={<BlogArticle />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
