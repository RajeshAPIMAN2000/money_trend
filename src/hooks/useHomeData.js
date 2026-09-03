import { useCallback, useEffect, useState } from 'react'
import { api, getToken } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  parseCompareInvest,
  parseCompareResponse,
  parseHomeDashboard,
  parseHomeProducts,
  parseHomeServices,
  parsePlatformStats,
  parseRateTicker,
} from '../lib/home.js'

export function useHomeData() {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [trustStats, setTrustStats] = useState([])
  const [tickerItems, setTickerItems] = useState([])
  const [compare, setCompare] = useState(null)
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const dashboardPromise = getToken()
          ? api.getHomeDashboard()
          : Promise.resolve({ data: { login_required: true, dashboard: null } })

        const [homeRes, productsRes, compareRes, fullRes, dashboardRes] = await Promise.all([
          api.getHome(),
          api.getHomeProducts(),
          api.getHomeCompare(),
          api.getHomeFull(),
          dashboardPromise,
        ])

        if (cancelled) return

        const homeData = homeRes?.data ?? homeRes

        setProducts(parseHomeProducts(productsRes))
        setServices(parseHomeServices(homeRes))
        setTrustStats(parsePlatformStats(homeRes))
        setTickerItems(parseRateTicker(homeRes))
        setCompare(parseCompareInvest(homeData?.compare_invest ? homeRes : fullRes))
        setDashboard(parseHomeDashboard(dashboardRes))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load home page data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setDashboard(parseHomeDashboard({ data: { login_required: true, dashboard: null } }))
      return undefined
    }

    let cancelled = false
    api.getHomeDashboard()
      .then((res) => {
        if (!cancelled) setDashboard(parseHomeDashboard(res))
      })
      .catch(() => {
        if (!cancelled) setDashboard(parseHomeDashboard({ data: { login_required: false, dashboard: null } }))
      })

    return () => { cancelled = true }
  }, [isAuthenticated])

  const fetchCompare = useCallback(async ({ type = 'fd', tenure, amount } = {}) => {
    const res = await api.getHomeCompare({
      type: type.toLowerCase(),
      tenure,
      amount,
    })
    return parseCompareResponse(res)
  }, [])

  return {
    loading,
    error,
    products,
    services,
    trustStats,
    tickerItems,
    compare,
    dashboard,
    fetchCompare,
  }
}
