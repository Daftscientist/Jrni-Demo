import { useEffect, useState } from 'react';
import { useAxios } from '../fetchContext';
import ErrorBanner from '../components/ErrorBanner';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import DropDown from '../components/DropDown';

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
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [postcode, setPostcode] = useState<string>('');
    const [addressOptions, setAddressOptions] = useState<string[]>([]);

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

        const addy_dropdown = formData.get('address_dropdown');

        const addy_json = JSON.parse(addy_dropdown as string);

        const number = formData.get('mobile_number') as string;
        const data = {
            consent: true,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            address1: addy_json.BUILDING_NUMBER,
            address2: addy_json.THOROUGHFARE_NAME,
            address3: addy_json.POST_TOWN,
            address4: addy_json.COUNTRY_CODE_DESCRIPTION.replace('This record is within ', ''), // replace with better system
            default_company_id: 37115,
            email: formData.get('email_address'),
            extra_info: { locale: 'en' },
            mobile: number.split('+44', 1)[1], // replace with better system,
            mobile_prefix: number.split('+44', 1)[0],
            mobile_prefix_country_code: 'GB',
            postcode: addy_json.POSTCODE,
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
            //document.location.href = '/confirmation';
        } catch (error) {
            setError('Error processing request');
        }
    };

    const postcodeOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPostcode(event.target.value);
        // regex to validate postcode
        const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;

        if (postcodeRegex.test(event.target.value)) {
            // make fetch request without using the axios instance
            const postcode_key = '';
            // use fetch

            fetch(`https://api.os.uk/search/places/v1/postcode?postcode=${event.target.value}&key=${postcode_key}`).then(
                (response) => {
                    if (response.status === 200) {
                        // get the json data
                        response.json().then((data) => {
                            setAddressOptions(data.results)
                        });
                    } else {
                        setError('Invalid postcode');
                        setIsDropdownVisible(false);
                    }
                }
            )
            setIsDropdownVisible(true);
        } else {
            setError('Invalid postcode');
            setIsDropdownVisible(false);
        }
    };

    const formulate_dropdown_items = (data: any) => {
        const tbr: { id: string; name: any; value: any; }[] = []
        data.map((addData: any) => {
            tbr.push(
                {
                    id: addData.DPA.UPRN,
                    name: addData.DPA.ADDRESS,
                    value: JSON.stringify(addData.DPA)
                }
            )
        })
        return tbr;
    }

    return (
        <>
            {error && <ErrorBanner message={error} />}
            <h1 className='text-4xl font-bold text-center p-4'>Personal Info</h1>
            <form className='max-w-sm mx-auto text-center bg-gray-200 p-12 rounded-md' onSubmit={onFormSubmit}>
                <TextInput label='First Name*' id='first_name' type='text' required={true} placeholder='' />
                <TextInput label='Last Name*' id='last_name' type='text' required={true} placeholder='' />
                <TextInput label='Email address*' id='email_address' type='email' required={true} placeholder='' />
                <TextInput label='Mobile Number' id='mobile_number' type='number' required={true} placeholder='' />
                <TextInput label='Postcode' id='postcode' type='text' required={true} placeholder={postcode} onChangeFunc={postcodeOnChange} />
                {isDropdownVisible && (
                    <DropDown
                        title='Select Address'
                        id='address_dropdown'
                        items={formulate_dropdown_items(addressOptions)}
                    />
                )}
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
