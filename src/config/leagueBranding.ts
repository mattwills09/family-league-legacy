/** League identity stays separate from presentation and league statistics. */
export interface LeagueBranding {
  name: string
  productName: string
  description: string
}

export const leagueBranding: LeagueBranding = {
  name: 'The 12th Timers',
  productName: 'Family League Legacy',
  description: 'Fantasy football history and analytics for the Williams, Lundy, Pomponio, Jaslow, and Wolfe families.',
}
