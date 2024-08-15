interface TextInputProps {
    label: string;
    id: string;
    type: string;
    placeholder: string;
    required: boolean;
    onChangeFunc?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ label, id, type, placeholder, required, onChangeFunc = () => {} }: TextInputProps) {
    return (
        <div className='mb-5'>
            <label htmlFor={id} className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder={placeholder}
                required={required}
                onChange={onChangeFunc || (() => {})}
            />
        </div>
    );
}
