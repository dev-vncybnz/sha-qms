import React, { forwardRef } from 'react';

const Ticket = (props, ref) => {
    const { code, destination } = props;

    return (
        <div ref={ref} className="w-fit flex flex-col items-center text-center gap-10 p-10 border-2 border-black mx-auto mt-5">
            <p>Your Ticket Number</p>
            <div>
                <p>Please proceed to {destination} when your number is called</p>
                <p className="text-4xl">{code}</p>
            </div>
            <p>Thank you for using our system !!!</p>
        </div>
    );
};

export default forwardRef(Ticket);
