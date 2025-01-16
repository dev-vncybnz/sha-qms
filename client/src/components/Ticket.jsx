import React, { forwardRef } from 'react';

const Ticket = (props, ref) => {
    const { code, destination } = props;

    return (
        <div ref={ref} className="w-fit flex flex-col items-center text-center gap-10 p-10 border-2 border-black mx-auto mt-5">
            <p>Your Ticket Number</p>
            <div>
                <p>Please proceed to {destination} when your number is called</p>
                <p className="text-4xl">{code}</p>

                {
                    code && code.includes('CAS') && (
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex gap-3 items-end">
                                <p><strong>Name:</strong></p>
                                <div className="grow bg-black h-px"></div>
                            </div>
                            <div className="flex gap-3 items-end">
                                <p><strong>Grade and Section:</strong></p>
                                <div className="grow bg-black h-px"></div>
                            </div>
                        </div>
                    )
                }

                {
                    code && code.includes('REG') && (
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex gap-3 items-end">
                                <p><strong>Purpose:</strong></p>
                                <div className="grow bg-black h-px"></div>
                            </div>
                        </div>
                    )
                }
            </div>
            <p>Thank you for using our system !!!</p>
        </div>
    );
};

export default forwardRef(Ticket);
