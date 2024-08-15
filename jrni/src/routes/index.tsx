import { useEffect, useState } from 'react';
import { useAxios } from '../fetchContext'; // Adjust the import path as necessary
import { Link } from 'react-router-dom';
import ErrorBanner from '../components/ErrorBanner';

interface Service {
    id: string;
    name: string;
    durations: number[];
    duration_unit: string;
}

export default function Index() {
    const axios = useAxios(); // This gives you the Axios instance from the context
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        axios
            .get('37115/services/?exclude_links[]=child_services&availability[]=0&page=1&per_page=9')
            .then((response) => {
                setServices(response.data._embedded.services);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, [axios]);

    return (
        <>
            {error && <ErrorBanner message={error} />}
            <h1 className='text-4xl font-bold text-center p-4'>Services</h1>

            <div className='relative overflow-x-auto pl-4 pr-4 rounded-lg'>
                <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                Service Name
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Duration
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700' key={service.id}>
                                <th
                                    scope='row'
                                    className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                                >
                                    {service.name}
                                </th>
                                <td className='px-6 py-4'>
                                    {service.durations.map((duration) => `${duration} ${service.duration_unit}`).join(', ')}
                                </td>
                                <td className='px-6 py-4'>
                                    <Link to={`/service/${service.id}`}>
                                        <button
                                            type='button'
                                            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                                        >
                                            Select
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
