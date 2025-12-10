import React from 'react'
import HeroSection from '../Component/HeroSection'
import ShopCategories from '../Component/ShopCategories'
import ProductsByShowroom from '../Component/ProductsByShowroom'

function Home() {
  return (
    <div>
      <HeroSection/>
      <ShopCategories/>
      <ProductsByShowroom/>
    </div>
  )
}

export default Home