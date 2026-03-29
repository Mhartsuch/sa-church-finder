import { ReactNode } from 'react'
import { Heart, MapPinned, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

type AuthPageShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Stay signed in',
    body: 'Your session now persists through an HTTP-only cookie, so you can pick up where you left off.',
  },
  {
    icon: Heart,
    title: 'Get ready for favorites',
    body: 'Saved churches and reviews are the next account features, and this foundation is what makes them possible.',
  },
  {
    icon: MapPinned,
    title: 'Explore at your pace',
    body: 'Browse churches first, then create an account when you want your discoveries to follow you around.',
  },
]

export const AuthPageShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) => {
  return (
    <div className='flex flex-1 bg-[#fff8f5]'>
      <div className='relative mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-10 lg:py-10'>
        <section className='relative overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,#ff385c_0%,#ff6b57_55%,#ffd5bd_100%)] p-8 text-white shadow-airbnb sm:p-10'>
          <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl' />
          <div className='absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[#1f4d45]/20 blur-3xl' />

          <div className='relative flex h-full flex-col justify-between gap-8'>
            <div className='space-y-5'>
              <span className='inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/90'>
                {eyebrow}
              </span>
              <div className='space-y-3'>
                <h1 className='max-w-xl text-4xl font-bold tracking-tight sm:text-5xl'>
                  {title}
                </h1>
                <p className='max-w-2xl text-base leading-7 text-white/90 sm:text-lg'>
                  {description}
                </p>
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
              {highlights.map(({ icon: Icon, title: itemTitle, body }) => (
                <div
                  key={itemTitle}
                  className='rounded-[24px] border border-white/25 bg-white/10 p-4 backdrop-blur-sm'
                >
                  <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <h2 className='text-lg font-semibold'>{itemTitle}</h2>
                  <p className='mt-2 text-sm leading-6 text-white/85'>{body}</p>
                </div>
              ))}
            </div>

            <div className='rounded-[28px] border border-white/25 bg-white/10 p-4 text-sm leading-6 text-white/90'>
              Prefer to look around first?{' '}
              <Link to='/search' className='font-semibold text-white underline underline-offset-4'>
                Explore churches
              </Link>{' '}
              without creating an account.
            </div>
          </div>
        </section>

        <section className='rounded-[32px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle sm:p-8'>
          {children}
          <div className='mt-6 border-t border-gray-200 pt-6 text-sm text-[#555555]'>
            {footer}
          </div>
        </section>
      </div>
    </div>
  )
}
