import { leagueBranding } from '../config/leagueBranding'

export function Header() {
  return (
    <header className="header">
      <div>
        <span className="eyebrow">{leagueBranding.name}</span>
        <h1>{leagueBranding.productName}</h1>
        <p>{leagueBranding.description}</p>
      </div>
    </header>
  )
}
