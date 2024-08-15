interface ErrorBannerProps {
    message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div
            className='p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300'
            role='alert'
        >
            <span className='font-medium'>Error!</span> {message}
        </div>
    );
}
