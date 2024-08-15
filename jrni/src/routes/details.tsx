import { useEffect, useState } from 'react';
import { useAxios } from '../fetchContext';
import ErrorBanner from '../components/ErrorBanner';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

interface Question {
    id: string;
    name: string;
    required: boolean;
    // Add other properties as needed
}

interface PageDetails {
    questions: Question[];
    offer_login: boolean;
    ask_address: boolean;
    no_phone: number;
    company_id: number;
    // tba
}

export default function Details() {
    const axios = useAxios();
    const [error, setError] = useState<string | null>(null);
    const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);

    const mainDetails = async () => {
        try {
            const response = await axios.get('37115/client_details/');
            if (response.status === 200) {
                setPageDetails(response.data);
            } else {
                setError('Error fetching main details');
            }
        } catch (error) {
            setError('Error fetching main details');
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('selection_data')) {
            document.location.href = '/';
            return;
        }
        mainDetails();
    }, [axios]);

    const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const number = formData.get('mobile_number') as string;
        const data = {
            consent: true,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            address1: formData.get('address'),
            address2: '',
            address3: formData.get('county'),
            address4: formData.get('town'),
            default_company_id: 37115,
            email: formData.get('email_address'),
            extra_info: { locale: 'en' },
            mobile: number.split('+44', 1)[1], // replace with better system,
            mobile_prefix: number.split('+44', 1)[0],
            mobile_prefix_country_code: 'GB',
            postcode: formData.get('postcode'),
            questions: pageDetails?.questions.map((question) => ({
                id: question.id,
                answer: formData.get('generated_programatically' + question.id),
            })),
            timezone: 'Europe/London',
        };

        try {
            const response = await axios.post('37115/client', data);
            if (response.status !== 201) {
                setError('Error submitting details');
                return;
            }

            const authToken = response.headers['auth-token'];
            if (!authToken) {
                setError('No auth token found. Please try again');
                return;
            }

            localStorage.setItem('user_auth_token', authToken);

            const company_id = pageDetails?.company_id;
            const basketResponse = await axios.post(
                `baskets?company_id=${company_id}`,
                {},
                { headers: { 'Auth-Token': authToken } }
            );

            if (basketResponse.status !== 201) {
                setError('Error creating basket');
                return;
            }

            const selectionData = JSON.parse(localStorage.getItem('selection_data') || '{}');
            if (!selectionData) {
                setError('No selection data found');
                return;
            }

            const AddServiceResp = await axios.post(
                `baskets/${basketResponse.data.id}/service_items`,
                {
                    basket_id: basketResponse.data.id,
                    company_id: company_id,
                    service_id: selectionData.service_id,
                    resource_id: selectionData.resource_id,
                    start: selectionData.start,
                    questions: pageDetails?.questions.map((question) => ({
                        id: question.id,
                        answer: formData.get('generated_programatically' + question.id),
                    })),
                },
                { headers: { 'Auth-Token': authToken } }
            );

            if (AddServiceResp.status !== 201) {
                setError('Error adding service to basket');
                return;
            }

            const { _links, ...user_data } = response.data;
            const checkoutResp = await axios.post(
                `baskets/${basketResponse.data.id}/checkout`,
                { basket_id: basketResponse.data.id, client: user_data },
                { headers: { 'Auth-Token': authToken } }
            );

            if (checkoutResp.status !== 201) {
                setError('Error checking out');
                return;
            }

            localStorage.setItem('checkout_data', JSON.stringify(checkoutResp.data));
            document.location.href = '/confirmation';
        } catch (error) {
            setError('Error processing request');
        }
    };

    return (
        <>
            {error && <ErrorBanner message={error} />}
            <h1 className='text-4xl font-bold text-center p-4'>Personal Info</h1>
            <form className='max-w-sm mx-auto text-center bg-gray-200 p-12 rounded-md' onSubmit={onFormSubmit}>
                <TextInput label='First Name*' id='first_name' type='text' required={true} placeholder='' />
                <TextInput label='Last Name*' id='last_name' type='text' required={true} placeholder='' />
                <TextInput label='Email address*' id='email_address' type='email' required={true} placeholder='' />
                <TextInput label='Mobile Number' id='mobile_number' type='number' required={true} placeholder='' />
                <TextInput label='Address' id='address' type='text' required={true} placeholder='' />
                <TextInput label='Town/City' id='town' type='text' required={true} placeholder='' />
                <TextInput label='County' id='county' type='text' required={true} placeholder='' />
                <TextInput label='Postcode' id='postcode' type='text' required={true} placeholder='' />
                {pageDetails?.questions.map((question) => (
                    <TextInput
                        key={question.id}
                        label={question.name}
                        id={'generated_programatically' + question.id}
                        type='text'
                        required={question.required}
                        placeholder=''
                    />
                ))}
                <Button type='submit' text='Submit' />
            </form>
        </>
    );
}
