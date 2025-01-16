import React from 'react'
import ForbiddenImage from '../assets/images/forbidden-img.png'

const Forbidden = () => {
  return (
      <div className="container h-screen flex justify-center items-center">
          <img src={ForbiddenImage} alt="" className="w-1/2" />
      </div>
    )
}

export default Forbidden