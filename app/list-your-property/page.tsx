import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List your rental property | Find My Future Home',
  description: 'Landlords and agents can create and publish a South African rental listing on Find My Future Home.',
}

export default function ListYourProperty() {
  return <main className="hero">
    <a href="/">← Home</a>
    <div className="eyebrow" style={{marginTop:28}}>FOR LANDLORDS AND AGENTS</div>
    <h1>List a place to rent.</h1>
    <p>Create an account, add your rental details and approximate location, then publish when you are ready. Renters can find your listing and send you an inquiry.</p>
    <p><a className="cta" style={{display:'inline-block'}} href="/landlord/listings">Create a rental listing</a></p>
    <p>Already have an account? <a href="/account">Log in</a>, then return here to create your listing.</p>
  </main>
}
