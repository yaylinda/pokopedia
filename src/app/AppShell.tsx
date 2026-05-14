import { useEffect } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export function AppShell() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const route = searchParams.get('route')

    if (!route) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete('route')
    navigate(`${route}${nextParams.size > 0 ? `?${nextParams.toString()}` : ''}`, {
      replace: true,
    })
  }, [navigate, searchParams])

  return (
    <main className="app-shell">
      <AppHeader />
      <Outlet />
    </main>
  )
}
