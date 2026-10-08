import { version } from '../../package.json'

export function Footer() {
  return (
    <footer className="footer">
      <span>{new Date().getFullYear()}</span>
      <span className="footer-version" aria-label={`Version ${version}`}>v{version}</span>
    </footer>
  )
}
