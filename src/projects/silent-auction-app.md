---
title: Silent Auction App
layout: project
---

I built a silent auction app for [Hospices of
Hope](https://hospicesofhope.co.uk/), who I have been working with for many
years now. At the time, they were spending a signficant amount of money on a
commercial solution and reached out to me to ask if I would help them develop an
app for running their silent auctions.

The app has been used at all of their fundraising events since 2016 and has helped them raise
a significant amount of money.

It has also recently been used by their partner charity in Serbia,
[BELhospice](https://belhospice.org/), to run their own silent auction.

## Tech stack

The app itself is a Single Page Application (SPA) designed to work on any device,
including mobile phones and tablets. It has gone through several iterations over
the years, but is currently built using the following technologies:

- [Vue.js](https://vuejs.org/)
  - My favourite JavaScript framework
  - I'm also using TypeScript this time around
- [Tailwind CSS](https://tailwindcss.com/), together with [DaisyUI](https://daisyui.com/)
  - I've grown to love the utility-first approach of Tailwind CSS
  - DaisyUI is a component library for Tailwind CSS that makes building
    beautiful apps a lot easier (especially for a person with limited design
    skills like myself)
- [Firebase](https://firebase.google.com/)
  - I'm using Firebase for the realtime database, authentication, file storage, and hosting
  - I've used Firebase since the initial version of the app, many years ago, and
    have found it pretty well suited to the app's requirements

## Screenshots

<div class="flex flex-wrap gap-8">
  <img src="/assets/img/auction-app-screenshot-1.png" class="w-[360px] mt-0" width="360"/>
  <img src="/assets/img/auction-app-screenshot-2.png" class="w-[360px] mt-0" width="360"/>
</div>
