import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ loading }) => {

    if (!loading) return null;

    return (
        <div className="fixed left-0 top-0 h-screen w-full bg-black/75 flex justify-center items-center">
            <div className="flex justify-center items-center space-x-2">
                <DotLottieReact
                    src="/lottie-loader.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>
    )
}

export default Loader