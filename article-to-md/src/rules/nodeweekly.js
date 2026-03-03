import { weeklyRule } from './javascriptweekly.js'

/** @type {import('./index.js').SiteRule} */
export default {
  ...weeklyRule,
  excludeSelectors: [
    ...weeklyRule.excludeSelectors,
    'img[src="https://res.cloudinary.com/cpress/image/upload/v1653576619/lgfqinzbdqttwmhvljxb.png"]'
  ],
}
