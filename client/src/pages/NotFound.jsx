import React from 'react'
import NotFoundImage from '../assets/images/not-found-404-img.png'

const NotFound = () => {
  return (
    <div className="container h-screen flex justify-center items-center">
        <img src={NotFoundImage} alt="" className="w-1/2" />
    </div>
  )
}

export default NotFound