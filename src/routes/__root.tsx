/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as React from 'react';
import { DefaultCatchBoundary } from '~/shared/ui/default-catch-boundary';
import { NotFound } from '~/shared/ui/not-found';
import appCss from '~/shared/styles/app.css?url';
import { seo } from '~/shared/utils/seo';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Can Two Knights Checkmate?',
        description: `Interactive chess proof: Why two knights cannot checkmate a lone king.`,
        image: '/og-thumbnail.png',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },

      { rel: 'icon', href: '/favicon.svg' },
    ],
    scripts: [
      {
        src: '/customScript.js',
        type: 'text/javascript',
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position='bottom-right' />
        <Scripts />
      </body>
    </html>
  );
}
