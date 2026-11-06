import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="border-t border-gray-200 bg-gray-50">
    <div className="flex flex-col gap-3 px-6 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between xl:px-20">
      <p>© {new Date().getFullYear()} SA Church Finder · Helping San Antonio find a church home</p>
      <nav className="flex gap-4">
        <Link to="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms
        </Link>
        <a href="mailto:admin@sachurchfinder.com" className="hover:underline">
          Contact
        </a>
      </nav>
    </div>
  </footer>
);
