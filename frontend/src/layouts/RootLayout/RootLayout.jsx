import {Link, Outlet} from "react-router-dom"
import {ClerkProvider, SignedIn, UserButton} from "@clerk/clerk-react"
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}
const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>

    <div className="px-16 py-4 h-screen flex flex-col">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center font-bold gap-2">
        <img src="/vite.svg" alt="" className="w-8 h-8
" />
              <span>Prakop.AI</span>
        </Link>
        <div className="user">
              <SignedIn>
              <UserButton />
              </SignedIn>
              </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet/>
      </main>
    </div>
              </ClerkProvider>
    

  )
}

export default RootLayout
