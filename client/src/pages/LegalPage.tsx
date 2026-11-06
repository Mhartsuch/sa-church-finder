import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const CONTACT = 'admin@sachurchfinder.com';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      [
        'What we collect',
        'When you create an account we store your name, email address, and a securely hashed password (or your Google account ID if you sign in with Google). We also store the churches you save and the reviews you write.',
      ],
      [
        'How we use it',
        'Your information is used only to run SA Church Finder: keeping you signed in, showing your wishlist, and displaying your reviews with your name. We never sell your data.',
      ],
      [
        'Church information',
        'Church listings are compiled from public sources such as church websites and Google Places. Churches can contact us to correct their listing.',
      ],
      [
        'Your choices',
        'You can edit your name, change your password, or permanently delete your account and everything associated with it from the Account page at any time.',
      ],
      ['Contact', `Questions? Email ${CONTACT}.`],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      [
        'Using SA Church Finder',
        'SA Church Finder is a free directory to help people discover churches in San Antonio. Service times and details can change, so please confirm with the church before visiting.',
      ],
      [
        'Reviews',
        'Reviews should reflect your genuine experience and be respectful. We may remove content that is abusive, misleading, or unrelated to the church.',
      ],
      [
        'Accounts',
        'You are responsible for keeping your login secure. We may suspend accounts that misuse the service.',
      ],
      ['Contact', `Questions or corrections? Email ${CONTACT}.`],
    ],
  },
} as const;

const LegalPage = ({ kind }: { kind: keyof typeof CONTENT }) => {
  const page = CONTENT[kind];
  useDocumentTitle(page.title);
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-12">
      <h1 className="text-[32px] font-semibold">{page.title}</h1>
      {page.sections.map(([heading, body]) => (
        <section key={heading} className="mt-8">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{body}</p>
        </section>
      ))}
    </main>
  );
};

export default LegalPage;
