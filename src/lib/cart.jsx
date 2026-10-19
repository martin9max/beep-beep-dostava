import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { findItem, priceOf, shopBySlug } from '../catalog'

const CartContext = createContext(null)
const KEY = 'bb-korpa'
const ADDRESS_KEY = 'bb-privremena-adresa'

/**
 * Korpa: stavke iz jednog ili više lokala + napomena po lokalu.
 * Čuva se u browseru (localStorage), pa ostaje i posle osvežavanja stranice.
 */
export function CartProvider({ children }) {
  const [state, setState] = useState({ items: [], requests: {} })
  const [loaded, setLoaded] = useState(false)
  // privremena adresa ("nisam kod kuće"); null = stalna adresa iz naloga
  const [tempAddress, setTempAddress] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY))
      // stavke koje su u međuvremenu izbačene iz menija se preskaču
      if (saved?.items) setState({ items: saved.items.filter((l) => findItem(l.shop, l.id)), requests: saved.requests ?? {} })
      setTempAddress(JSON.parse(localStorage.getItem(ADDRESS_KEY)))
    } catch {
      /* prazna korpa */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* privatni režim: korpa traje do zatvaranja stranice */
    }
  }, [state, loaded])

  useEffect(() => {
    if (!loaded) return
    try {
      if (tempAddress) localStorage.setItem(ADDRESS_KEY, JSON.stringify(tempAddress))
      else localStorage.removeItem(ADDRESS_KEY)
    } catch {
      /* privatni režim */
    }
  }, [tempAddress, loaded])

  const value = useMemo(() => {
    const same = (l, shop, id, variant) => l.shop === shop && l.id === id && l.variant === variant
    const setQty = (shop, id, variant, qty) =>
      setState((s) => {
        const rest = s.items.filter((l) => !same(l, shop, id, variant))
        if (qty <= 0) return { ...s, items: rest }
        const existing = s.items.findIndex((l) => same(l, shop, id, variant))
        const line = { shop, id, variant, qty: Math.min(qty, 50) }
        if (existing === -1) return { ...s, items: [...s.items, line] }
        const items = [...s.items]
        items[existing] = line
        return { ...s, items }
      })
    const qtyOf = (shop, id, variant) => state.items.find((l) => same(l, shop, id, variant))?.qty ?? 0
    const setRequest = (shop, text) => setState((s) => ({ ...s, requests: { ...s.requests, [shop]: text } }))

    const lines = state.items.map((l) => {
      const item = findItem(l.shop, l.id)
      return { ...l, item, price: priceOf(item, l.variant) }
    })
    // lokali redom kojim su dodavani, sa stavkama i napomenom
    const slugs = [...new Set([...lines.map((l) => l.shop), ...Object.keys(state.requests).filter((k) => state.requests[k]?.trim())])]
    const shops = slugs.map((slug) => ({
      shop: shopBySlug(slug),
      lines: lines.filter((l) => l.shop === slug),
      request: state.requests[slug] ?? '',
    }))

    return {
      items: state.items,
      requests: state.requests,
      shops,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((t, l) => t + (l.price ?? 0) * l.qty, 0),
      hasUnpriced: lines.some((l) => l.price == null),
      isEmpty: shops.length === 0,
      qtyOf,
      setQty,
      setRequest,
      removeShop: (slug) =>
        setState((s) => ({ items: s.items.filter((l) => l.shop !== slug), requests: { ...s.requests, [slug]: '' } })),
      clear: () => setState({ items: [], requests: {} }),
      tempAddress,
      setTempAddress,
    }
  }, [state, tempAddress])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
