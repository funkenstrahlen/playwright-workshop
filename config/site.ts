export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'Playwright Demo App',
  description: 'A demo application for Playwright testing workshops',
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Public News',
      href: '/news/public',
    },
    {
      label: 'Private News',
      href: '/news/private',
    },
    {
      label: 'Clock',
      href: '/clock',
    },
    {
      label: 'File Download',
      href: '/file-download',
    },
  ],
  navMenuItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Public News',
      href: '/news/public',
    },
    {
      label: 'Private News',
      href: '/news/private',
    },
    {
      label: 'Clock',
      href: '/clock',
    },
    {
      label: 'File Download',
      href: '/file-download',
    },
    {
      label: 'Settings',
      href: '/settings',
    },
  ],
};
