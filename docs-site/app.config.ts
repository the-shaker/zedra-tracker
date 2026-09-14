export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'Zedra',
      description: 'Документация трекера проектов Zedra: руководство пользователя, архитектура, справочник разработчика.'
    },
    theme: {
      customizable: true,
      color: 'slate',
      radius: 0.5
    },
    header: {
      title: 'Zedra',
      showTitle: true,
      darkModeToggle: true,
      logo: {
        light: '/logo.svg',
        dark: '/logo-dark.svg',
        alt: 'Zedra'
      },
      nav: [
        { title: 'Документация', to: '/getting-started/introduction', showLinkIcon: false },
        { title: 'Пользователю', to: '/guide/user-guide', showLinkIcon: false },
        { title: 'Разработчику', to: '/reference/developer-guide', showLinkIcon: false }
      ],
      links: []
    },
    aside: {
      useLevel: true,
      collapse: false
    },
    main: {
      breadCrumb: true,
      showTitle: true
    },
    footer: {
      credits: 'Zedra | Трекер проектов',
      links: []
    },
    toc: {
      enable: true,
      title: 'На этой странице',
      links: []
    },
    search: {
      enable: true,
      inAside: false
    }
  }
})
