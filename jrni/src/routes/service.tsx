import { useEffect, useState, ChangeEvent } from 'react';
import { useAxios } from '../fetchContext';
import { useParams } from 'react-router-dom';
import ErrorBanner from '../components/ErrorBanner';
import DynamicTable from '../components/DynamicTable';

interface Resource {
    id: string;
    name: string;
    href: string;
    times_url: string;
}

export default function Service() {
    const axios = useAxios();
    const { service_id } = useParams<{ service_id: string }>();
    const [error, setError] = useState<string | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [times, setTimes] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

    const handleResources = async () => {
        try {
            const serviceResponse = await axios.get(`37115/items?service_id=${service_id}`);
            if (serviceResponse.status !== 200) {
                setError("Error fetching service");
                return;
            }

            if (resources.length === 0) {
                for (const resource of serviceResponse.data._embedded.items) {
                    const response = await axios.get(`37115/resources/${resource.resource_item_id}`);
                    if (response.status !== 200) {
                        setError("Error fetching resources");
                        return;
                    }
                    setResources((prev) => [
                        ...prev,
                        {
                            id: response.data.id,
                            name: response.data.name,
                            href: response.data._links.self.href,
                            times_url: `times?service_id=${service_id}&resource_id=${response.data.id}`,
                        },
                    ]);
                }
            }

            const timesArray: any[] = [];
            if (selectedResource === null) {
                for (const resource of resources) {
                    const timedResponse = await axios.get(`37115/times?service_id=${service_id}&resource_id=${resource.id}&start_date=${selectedDate}&end_date=${selectedDate}&time_zone=Europe%2FLondon`);
                    if (timedResponse.status === 200) {
                        timedResponse.data.times.forEach((time: any) => {
                            time['resource_id'] = resource.id;
                            timesArray.push(time);
                        });
                    }
                }
            } else {
                const timedResponse = await axios.get(`37115/times?service_id=${service_id}&resource_id=${selectedResource.id}&start_date=${selectedDate}&end_date=${selectedDate}&time_zone=Europe%2FLondon`);
                if (timedResponse.status === 200) {
                    timedResponse.data.times.forEach((time: any) => {
                        time['resource_id'] = selectedResource.id;
                        timesArray.push(time);
                    });
                }
            }
            setTimes(timesArray);
        } catch (error) {
            setError("Error fetching resources or times");
        }
    };

    useEffect(() => {
        handleResources();
        setError(null);
    }, [axios, service_id, selectedDate, selectedResource]);

    const onResourceSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const resourceId = event.target.value;
        if (resourceId === 'any') {
            setSelectedResource(null);
            return;
        }
        const selected = resources.find((resource) => resource.id === resourceId);
        setSelectedResource(selected || null);
    };

    const onDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        if (date === '') {
            setError("Please select a date");
            return;
        }
        if (date < new Date().toISOString().split('T')[0]) {
            setError('Select a date in the future only');
            return;
        }
        setSelectedDate(date);
    };

    const handleTimeSelection = async (time: any) => {
        localStorage.setItem('selection_data', JSON.stringify({
            service_id: service_id,
            time: time.start.split('T')[1],
            date: time.start.split('T')[0],
            start: time.start,
            resource_id: time.resource_id,
        }));
        document.location.href = '/details';
    };

    const titles = ['Day', 'Time', 'Action'];
    const bodies = times
        .filter(time => time.available)
        .map(time => ([
            time.start.split('T')[0], // Day
            time.start.split('T')[1].split('+')[0], // Time
            <button
                onClick={() => handleTimeSelection(time)}
                type='button'
                className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
            >
                Select
            </button>
        ]));

    return (
        <>
            {error && <ErrorBanner message={error} />}
            <h1 className='text-4xl font-bold text-center p-4'>Service</h1>
            <form className='max-w-sm mx-auto text-center'>
                <label htmlFor='resources' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                    Select resource
                </label>
                <select
                    id='resources'
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    onChange={onResourceSelectionChange}
                    value={selectedResource?.id || ''}
                >
                    <option value='any'>Any available</option>
                    {resources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                            {resource.name}
                        </option>
                    ))}
                </select>
            </form>
            <h2 className='text-2xl font-bold text-center p-4'>Select a date</h2>
            <div className='text-center'>
                <input onChange={onDateChange} type="date" id="date" name="date" />
            </div>
            <h2 className='text-2xl font-bold text-center p-4'>Available times</h2>
            <DynamicTable titles={titles} bodies={bodies} />
        </>
    );
}
