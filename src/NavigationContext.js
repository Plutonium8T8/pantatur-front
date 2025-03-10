import { createContext, useContext, useMemo } from "react"
import { useNavigate } from "react-router-dom"

const NavigationContext = createContext(null)

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate()

  const contextValue = useMemo(() => ({ navigate }), [navigate])

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  return useContext(NavigationContext)
}
