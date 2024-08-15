import { useEffect, useState } from 'react';
import { useAxios } from '../fetchContext'; // Adjust the import path as necessary

interface CheckoutData {
    long_id: string;
    _embedded?: {
        member: {
            bookings: any[];
        };
    };
}

export default function Confirmation() {
    const axios = useAxios(); // This gives you the Axios instance from the context
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({} as CheckoutData);

    useEffect(() => {
        const checkoutDataString = localStorage.getItem('checkout_data');
        if (!checkoutDataString) {
            document.location.href = '/';
            return;
        }

        const data = JSON.parse(checkoutDataString) as CheckoutData;
        setCheckoutData(data);

        // Clear local storage
        ['checkout_data', 'selection_data', 'user_auth_token'].forEach(item => localStorage.removeItem(item));
    }, [axios]);

    localStorage.theme = 'dark';

    return (
        <>
            <h3 className='text-2xl font-bold text-center p-4'>Booking Details</h3>
            <h5 className='text-lg font-bold text-center p-4'>Thank you for booking with us!</h5>
            <p className='text-lg font-bold text-center p-4'>Booking reference ID: {checkoutData.long_id}</p>
        </>
    );
}
