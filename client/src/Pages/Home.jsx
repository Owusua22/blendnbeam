
import HeroSection from '../Component/HeroSection'
import ShopCategories from '../Component/ShopCategories'
import ProductsByShowroom from '../Component/ProductsByShowroom'
import Chairs from '../Component/CategoriesComponent/Chairs'
import Comb from '../Component/CategoriesComponent/Comb'
import NewArrivalsPage from '../Component/NewArrivals'
import Footer from '../Component/Footer'

function Home() {
  return (
    <div>
      <HeroSection/>
      <ShopCategories/>
      <ProductsByShowroom/>
      <Chairs/>
      <div>
  <Comb/>
      </div>
      <NewArrivalsPage/>
      <Footer/>
    
    </div>
  )
}

export default Home