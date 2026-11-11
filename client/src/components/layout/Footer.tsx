import { Link } from 'react-router-dom';

import { CONTACT_EMAIL, familyLabel } from '@/lib/format';

/** Areas and traditions with enough churches to make a useful landing page. */
const AREAS = [
  'Downtown',
  'Alamo Heights',
  'Stone Oak',
  'Northwest Side',
  'Northeast Side',
  'West Side',
  'South Side',
  'East Side',
  'Medical Center',
  'Helotes',
  'Converse',
  'Universal City',
];

const TRADITIONS = [
  'Catholic',
  'Baptist',
  'Non-denominational',
  'Methodist',
  'Lutheran',
  'Pentecostal',
  'Presbyterian/Reformed',
  'Anglican/Episcopal',
  'Restoration Movement',
  'Orthodox',
];

const browseLink = (param: 'neighborhood' | 'denomination', value: string) =>
  `/?${param}=${encodeURIComponent(value)}`;

const column = 'grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3';

export const Footer = () => (
  <footer className="border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
    <div className="grid gap-8 px-6 py-10 md:grid-cols-2 xl:px-20">
      <nav aria-label="Churches by area">
        <h2 className="font-semibold text-gray-900">Churches by area</h2>
        <ul className={`mt-3 ${column}`}>
          {AREAS.map((area) => (
            <li key={area}>
              <Link to={browseLink('neighborhood', area)} className="hover:underline">
                {area}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Churches by tradition">
        <h2 className="font-semibold text-gray-900">Churches by tradition</h2>
        <ul className={`mt-3 ${column}`}>
          {TRADITIONS.map((family) => (
            <li key={family}>
              <Link to={browseLink('denomination', family)} className="hover:underline">
                {familyLabel(family)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between xl:px-20">
      <p>© {new Date().getFullYear()} SA Church Finder · Helping San Antonio find a church home</p>
      <nav aria-label="Site" className="flex gap-4">
        <Link to="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
          Contact
        </a>
      </nav>
    </div>
  </footer>
);
