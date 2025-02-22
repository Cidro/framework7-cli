module.exports = (options) => {
  const { name, customColor, color } = options;

  const manifest = {
    name,
    short_name: name,
    description: name,
    lang: 'en-US',
    start_url: '/',
    display: 'standalone',
    background_color: customColor && color ? `#${color}` : '#EE350F',
    theme_color: customColor && color ? `#${color}` : '#EE350F',
    icons: [
      {
        src: '/static/icons/128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/static/icons/144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/static/icons/152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/static/icons/192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/static/icons/256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/static/icons/512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
  return JSON.stringify(manifest, null, 2);
};
